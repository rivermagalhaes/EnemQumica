-- ==================== ENEM FLASH DATABASE SCHEMA ====================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  avatar_url TEXT,
  school TEXT,
  grade INTEGER CHECK (grade >= 1 AND grade <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER PROGRESS ====================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('quimica_geral', 'organica', 'physichem')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  completed_lessons TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- ==================== SIMULATOR SESSIONS ====================
CREATE TABLE simulator_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  simulator_type TEXT NOT NULL CHECK (simulator_type IN ('thermo', 'kinetics', 'solutions', 'gases', 'molecule_builder', 'memory_game', 'detective')),
  parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== QUIZ ATTEMPTS ====================
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  module TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER,
  correct_answers INTEGER,
  time_spent_seconds INTEGER,
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ENEM QUESTIONS ====================
CREATE TABLE enem_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  exam_type TEXT DEFAULT 'azul',
  question_number INTEGER,
  subject TEXT CHECK (subject IN ('quimica', 'fisica', 'biologia')),
  topic TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd', 'e')),
  explanation TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== TEACHER CLASSES ====================
CREATE TABLE teacher_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  class_code TEXT UNIQUE NOT NULL,
  school TEXT,
  grade INTEGER CHECK (grade >= 1 AND grade <= 3),
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CLASS ENROLLMENTS ====================
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES teacher_classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- ==================== DAILY CHALLENGES ====================
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  challenge_type TEXT CHECK (challenge_type IN ('quiz', 'simulator', 'molecule_builder')),
  challenge_data JSONB DEFAULT '{}',
  reward_xp INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ENEM NEWS ====================
CREATE TABLE enem_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  source TEXT DEFAULT 'INEP',
  url TEXT UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  category TEXT CHECK (category IN ('inscricoes', 'provas', 'resultados', 'geral')),
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_simulator_sessions_user_id ON simulator_sessions(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_enem_questions_year ON enem_questions(year);
CREATE INDEX idx_enem_questions_topic ON enem_questions(topic);
CREATE INDEX idx_enem_news_category ON enem_news(category);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Simulator sessions policies
CREATE POLICY "Users can view own sessions" ON simulator_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON simulator_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teacher can view their classes
CREATE POLICY "Teachers can view own classes" ON teacher_classes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage own classes" ON teacher_classes
  FOR ALL USING (auth.uid() = teacher_id);

-- Students can view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes" ON class_enrollments
  FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM teacher_classes
      WHERE teacher_classes.id = class_enrollments.class_id
      AND teacher_classes.teacher_id = auth.uid()
    )
  );

-- ENEM questions and news are public (read-only)
ALTER TABLE enem_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enem_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ENEM questions" ON enem_questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view ENEM news" ON enem_news
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view daily challenges" ON daily_challenges
  FOR SELECT USING (true);

-- ==================== FUNCTIONS ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update student count in teacher_classes
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teacher_classes
        SET student_count = student_count + 1
        WHERE id = NEW.class_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teacher_classes
        SET student_count = student_count - 1
        WHERE id = OLD.class_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_count_on_enrollment
    AFTER INSERT OR DELETE ON class_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_class_student_count();
