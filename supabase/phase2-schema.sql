-- ==================== PHASE 2: ADAPTIVE LEARNING SCHEMA ====================

-- Learning Analytics Table
CREATE TABLE learning_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  competency TEXT CHECK (competency IN ('C1', 'C2', 'C3', 'C4', 'C5')),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  avg_time_seconds INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  last_attempt TIMESTAMP WITH TIME ZONE,
  mastery_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  recommended_priority INTEGER DEFAULT 3, -- 1=urgent, 5=ok
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

CREATE INDEX idx_analytics_user ON learning_analytics(user_id);
CREATE INDEX idx_analytics_mastery ON learning_analytics(mastery_score);
CREATE INDEX idx_analytics_priority ON learning_analytics(recommended_priority);

-- Question Explanations Table
CREATE TABLE question_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES enem_questions(id) ON DELETE CASCADE,
  why_correct TEXT NOT NULL,
  common_mistakes JSONB DEFAULT '[]', -- [{option: 'b', why_wrong: '...', trap: '...'}]
  key_concept TEXT NOT NULL,
  related_topics TEXT[] DEFAULT '{}',
  video_url TEXT,
  difficulty_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id)
);

-- Answer Analysis Table (error tracking)
CREATE TABLE answer_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES enem_questions(id) ON DELETE CASCADE,
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN GENERATED ALWAYS AS (user_answer = correct_answer) STORED,
  error_type TEXT CHECK (error_type IN ('concept', 'interpretation', 'calculation', 'carelessness', 'none')),
  trap_fallen TEXT,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answer_analysis_user ON answer_analysis(user_id);
CREATE INDEX idx_answer_analysis_error ON answer_analysis(error_type);
CREATE INDEX idx_answer_analysis_question ON answer_analysis(question_id);

-- ENEM Simulations Table
CREATE TABLE enem_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  simulation_type TEXT CHECK (simulation_type IN ('full', 'cn', 'ch', 'lc', 'mt')) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  total_time_seconds INTEGER,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  score_raw INTEGER, -- acertos brutos
  score_tri DECIMAL(5,2), -- nota TRI estimada (0-1000)
  percentage DECIMAL(5,2), -- percentual de acertos
  questions_order JSONB DEFAULT '[]', -- array de question IDs
  answers JSONB DEFAULT '{}', -- {question_id: answer}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_simulations_user ON enem_simulations(user_id);
CREATE INDEX idx_simulations_status ON enem_simulations(status);
CREATE INDEX idx_simulations_finished ON enem_simulations(finished_at);

-- ==================== MATERIALIZED VIEW FOR STUDENT FOCUS ====================

CREATE MATERIALIZED VIEW student_focus_areas AS
SELECT 
  user_id,
  topic,
  competency,
  mastery_score,
  total_attempts,
  correct_attempts,
  avg_time_seconds,
  CASE 
    WHEN mastery_score < 0.40 THEN 'critical'
    WHEN mastery_score < 0.60 THEN 'needs_review'
    WHEN mastery_score < 0.80 THEN 'good'
    ELSE 'mastered'
  END as status,
  recommended_priority,
  last_attempt
FROM learning_analytics
WHERE total_attempts >= 3
ORDER BY user_id, recommended_priority ASC, mastery_score ASC;

CREATE UNIQUE INDEX ON student_focus_areas (user_id, topic);

-- ==================== FUNCTIONS ====================

-- Function: Update Learning Analytics (called after quiz)
CREATE OR REPLACE FUNCTION update_learning_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_topic TEXT;
  v_competency TEXT;
  v_correct INTEGER;
  v_total INTEGER;
  v_mastery DECIMAL(3,2);
  v_priority INTEGER;
BEGIN
  -- Extract topic from quiz (simplified - adapt to your data)
  v_topic := NEW.module;
  v_competency := 'C1'; -- TODO: map from question data
  
  -- Get stats from answers JSONB
  v_total := (SELECT COUNT(*) FROM jsonb_object_keys(NEW.answers));
  v_correct := NEW.correct_answers;
  
  -- Calculate mastery
  v_mastery := CASE 
    WHEN v_total > 0 THEN v_correct::DECIMAL / v_total 
    ELSE 0 
  END;
  
  -- Determine priority
  v_priority := CASE 
    WHEN v_mastery < 0.40 THEN 1
    WHEN v_mastery < 0.60 THEN 2
    WHEN v_mastery < 0.80 THEN 3
    ELSE 4
  END;
  
  -- Upsert learning analytics
  INSERT INTO learning_analytics (
    user_id, 
    topic, 
    competency,
    total_attempts, 
    correct_attempts,
    avg_time_seconds,
    mastery_score,
    recommended_priority,
    last_attempt
  )
  VALUES (
    NEW.user_id,
    v_topic,
    v_competency,
    v_total,
    v_correct,
    NEW.time_spent_seconds / v_total,
    v_mastery,
    v_priority,
    NEW.created_at
  )
  ON CONFLICT (user_id, topic) DO UPDATE SET
    total_attempts = learning_analytics.total_attempts + v_total,
    correct_attempts = learning_analytics.correct_attempts + v_correct,
    avg_time_seconds = (learning_analytics.avg_time_seconds + (EXCLUDED.avg_time_seconds)) / 2,
    mastery_score = (learning_analytics.mastery_score * 0.7 + v_mastery * 0.3), -- weighted average
    recommended_priority = CASE 
      WHEN (learning_analytics.mastery_score * 0.7 + v_mastery * 0.3) < 0.40 THEN 1
      WHEN (learning_analytics.mastery_score * 0.7 + v_mastery * 0.3) < 0.60 THEN 2
      WHEN (learning_analytics.mastery_score * 0.7 + v_mastery * 0.3) < 0.80 THEN 3
      ELSE 4
    END,
    last_attempt = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update analytics after quiz
CREATE TRIGGER trigger_update_learning_analytics
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_analytics();

-- Function: Get Daily Recommendations
CREATE OR REPLACE FUNCTION get_daily_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE(
  topic TEXT,
  reason TEXT,
  priority INTEGER,
  mastery DECIMAL(3,2),
  total_attempts INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.topic,
    CASE 
      WHEN la.mastery_score < 0.40 THEN '🚨 Precisa de atenção urgente! Revisar conceitos básicos'
      WHEN la.mastery_score < 0.60 THEN '📚 Revisar este assunto ajudará muito sua nota'
      WHEN DATE_PART('day', NOW() - la.last_attempt) > 7 THEN '⏰ Não praticado há uma semana - revisar!'
      WHEN la.avg_time_seconds > 180 THEN '⚡ Você demora muito neste assunto - praticar agilidade'
      ELSE '💪 Consolidar conhecimento para não esquecer'
    END as reason,
    la.recommended_priority,
    la.mastery_score,
    la.total_attempts,
    CASE 
      WHEN la.mastery_score < 0.40 THEN 'critical'
      WHEN la.mastery_score < 0.60 THEN 'needs_review'
      WHEN la.mastery_score < 0.80 THEN 'good'
      ELSE 'mastered'
    END as status
  FROM learning_analytics la
  WHERE la.user_id = p_user_id
    AND la.total_attempts >= 2
  ORDER BY 
    (CASE WHEN la.mastery_score < 0.50 THEN 1 ELSE 2 END),
    la.recommended_priority ASC,
    la.last_attempt ASC NULLS FIRST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Weak Topics (for "Assuntos em Risco")
CREATE OR REPLACE FUNCTION get_weak_topics(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  topic TEXT,
  competency TEXT,
  mastery_score DECIMAL(3,2),
  total_attempts INTEGER,
  correct_attempts INTEGER,
  status TEXT,
  trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.topic,
    la.competency,
    la.mastery_score,
    la.total_attempts,
    la.correct_attempts,
    CASE 
      WHEN la.mastery_score < 0.40 THEN 'critical'
      WHEN la.mastery_score < 0.60 THEN 'needs_review'
      ELSE 'improving'
    END as status,
    CASE 
      WHEN DATE_PART('day', NOW() - la.last_attempt) > 14 THEN 'forgotten'
      WHEN la.mastery_score < (SELECT AVG(mastery_score) FROM learning_analytics WHERE user_id = p_user_id) THEN 'below_avg'
      ELSE 'stable'
    END as trend
  FROM learning_analytics la
  WHERE la.user_id = p_user_id
    AND la.mastery_score < 0.70
    AND la.total_attempts >= 3
  ORDER BY 
    la.mastery_score ASC,
    la.recommended_priority ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate TRI Score (simplified)
CREATE OR REPLACE FUNCTION calculate_tri_score(
  p_questions JSONB,
  p_answers JSONB
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_score DECIMAL(5,2) := 0;
  v_max_score DECIMAL(5,2) := 0;
  v_question JSONB;
  v_weight DECIMAL(3,2);
  v_question_id TEXT;
  v_user_answer TEXT;
  v_correct_answer TEXT;
BEGIN
  -- Iterate through questions
  FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    v_question_id := v_question->>'id';
    v_correct_answer := v_question->>'correct_answer';
    v_user_answer := p_answers->>v_question_id;
    
    -- Weight based on difficulty
    v_weight := CASE v_question->>'difficulty'
      WHEN 'hard' THEN 1.5
      WHEN 'medium' THEN 1.2
      ELSE 1.0
    END;
    
    v_max_score := v_max_score + (100 * v_weight);
    
    -- Add score if correct
    IF v_user_answer = v_correct_answer THEN
      v_score := v_score + (100 * v_weight);
    END IF;
  END LOOP;
  
  -- Normalize to 0-1000 scale
  IF v_max_score > 0 THEN
    RETURN (v_score / v_max_score) * 1000;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================== RLS POLICIES ====================

-- Learning Analytics
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert/update analytics" ON learning_analytics
  FOR ALL USING (true); -- Triggers need full access

-- Question Explanations (public read)
ALTER TABLE question_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view explanations" ON question_explanations
  FOR SELECT USING (true);

-- Answer Analysis
ALTER TABLE answer_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answer analysis" ON answer_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answer analysis" ON answer_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ENEM Simulations
ALTER TABLE enem_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations" ON enem_simulations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own simulations" ON enem_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations" ON enem_simulations
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== REFRESH MATERIALIZED VIEW ====================

-- Function to refresh student focus view
CREATE OR REPLACE FUNCTION refresh_student_focus()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_focus_areas;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh view
CREATE TRIGGER trigger_refresh_focus_on_analytics
  AFTER INSERT OR UPDATE ON learning_analytics
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_student_focus();
