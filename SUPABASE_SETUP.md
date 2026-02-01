# 🗄️ Guia: Aplicar Phase 2 Schema no Supabase

## ✅ Passo 1: Acessar Supabase

1. **Abra seu navegador**: https://supabase.com
2. **Faça login** com sua conta
3. **Selecione seu projeto** `enem-flash` (ou crie um novo se ainda não tiver)

---

## 📋 Passo 2: Abrir SQL Editor

No menu lateral esquerdo:
1. Clique em **"SQL Editor"** (ícone `</>`)
2. Clique em **"New query"** (botão verde no canto superior)

---

## 🔧 Passo 3: Aplicar o Schema

### 3.1 Copiar o SQL

1. Abra o arquivo: `supabase/phase2-schema.sql`
2. **Selecione TUDO** (Ctrl+A)
3. **Copie** (Ctrl+C)

### 3.2 Colar e Executar

1. No SQL Editor do Supabase, **cole todo o código** (Ctrl+V)
2. Clique em **"Run"** (botão verde no canto inferior direito)
3. **Aguarde 5-10 segundos** (ele vai criar tabelas, funções, triggers, etc.)

### 3.3 Verificar Sucesso

Você deve ver mensagens como:
```
✓ Success. No rows returned
```

Se aparecer **erro**, copie a mensagem de erro completa e me envie!

---

## 🧪 Passo 4: Testar as Tabelas

### 4.1 Verificar Tabelas Criadas

No SQL Editor, **nova query**:

```sql
-- Ver todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'learning_analytics',
    'question_explanations',
    'answer_analysis',
    'enem_simulations'
  )
ORDER BY table_name;
```

**Clique "Run"**

Devem aparecer 4 tabelas:
- ✅ `answer_analysis`
- ✅ `enem_simulations`
- ✅ `learning_analytics`
- ✅ `question_explanations`

---

### 4.2 Verificar Funções SQL

```sql
-- Ver funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_daily_recommendations',
    'get_weak_topics',
    'calculate_tri_score',
    'update_learning_analytics'
  );
```

**Clique "Run"**

Devem aparecer 4 funções:
- ✅ `calculate_tri_score`
- ✅ `get_daily_recommendations`
- ✅ `get_weak_topics`
- ✅ `update_learning_analytics`

---

### 4.3 Verificar Materialized View

```sql
-- Ver views materializadas
SELECT matviewname 
FROM pg_matviews 
WHERE schemaname = 'public';
```

**Clique "Run"**

Deve aparecer:
- ✅ `student_focus_areas`

---

## 🎯 Passo 5: Testar Funções (Dados de Exemplo)

### 5.1 Criar Usuário de Teste

```sql
-- Criar usuário de teste (se não tiver)
INSERT INTO users (id, email, name, user_type)
VALUES (
  gen_random_uuid(),
  'teste@aluno.com',
  'João Teste',
  'student'
)
ON CONFLICT (email) DO NOTHING
RETURNING id, name;
```

**Copie o ID retornado!** Você vai usar nos próximos testes.

---

### 5.2 Inserir Dados de Teste

**Substitua `SEU-USER-ID-AQUI` pelo ID que você copiou!**

```sql
-- Inserir dados de learning analytics
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
VALUES 
  ('SEU-USER-ID-AQUI', 'Termoquímica', 'C1', 10, 4, 120, 0.40, 1, NOW()),
  ('SEU-USER-ID-AQUI', 'Cinética Química', 'C2', 8, 5, 90, 0.625, 2, NOW() - INTERVAL '3 days'),
  ('SEU-USER-ID-AQUI', 'Estequiometria', 'C1', 15, 12, 75, 0.80, 4, NOW() - INTERVAL '10 days'),
  ('SEU-USER-ID-AQUI', 'Oxirredução', 'C3', 5, 2, 150, 0.40, 1, NOW() - INTERVAL '1 day');
```

**Execute!**

Deve aparecer: `Success. 4 rows affected.`

---

### 5.3 Testar Função de Recomendações

```sql
-- Testar recomendações diárias
SELECT 
  topic,
  reason,
  mastery,
  status
FROM get_daily_recommendations('SEU-USER-ID-AQUI', 3);
```

**Resultado esperado**: 3 linhas com recomendações personalizadas!

Exemplo:
| topic | reason | mastery | status |
|-------|--------|---------|--------|
| Termoquímica | 🚨 Precisa de atenção urgente! | 0.40 | critical |
| Oxirredução | 🚨 Precisa de atenção urgente! | 0.40 | critical |
| Cinética Química | 📚 Revisar este assunto... | 0.625 | needs_review |

---

### 5.4 Testar Assuntos Fracos

```sql
-- Testar assuntos em risco
SELECT 
  topic,
  mastery_score,
  total_attempts,
  correct_attempts,
  status,
  trend
FROM get_weak_topics('SEU-USER-ID-AQUI', 5);
```

**Resultado esperado**: Assuntos com mastery < 0.70

---

### 5.5 Testar Cálculo TRI

```sql
-- Testar cálculo de nota TRI
SELECT calculate_tri_score(
  -- Questões (simplificado para teste)
  '[
    {"id": "1", "difficulty": "easy", "correct_answer": "a"},
    {"id": "2", "difficulty": "medium", "correct_answer": "b"},
    {"id": "3", "difficulty": "hard", "correct_answer": "c"}
  ]'::jsonb,
  -- Respostas do aluno
  '{"1": "a", "2": "b", "3": "c"}'::jsonb
) as nota_tri;
```

**Resultado esperado**: `1000.00` (acertou tudo!)

Teste com erro:
```sql
SELECT calculate_tri_score(
  '[
    {"id": "1", "difficulty": "easy", "correct_answer": "a"},
    {"id": "2", "difficulty": "medium", "correct_answer": "b"},
    {"id": "3", "difficulty": "hard", "correct_answer": "c"}
  ]'::jsonb,
  '{"1": "a", "2": "x", "3": "c"}'::jsonb -- errou a 2
) as nota_tri;
```

**Resultado esperado**: ~833 (errou uma média)

---

## ✅ Checklist de Verificação

Marque o que funcionou:

### Estrutura Database
- [ ] 4 tabelas criadas
- [ ] 4 funções criadas
- [ ] 1 materialized view criada
- [ ] Triggers criados

### Testes Funcionais
- [ ] Usuário de teste criado
- [ ] Dados de analytics inseridos
- [ ] `get_daily_recommendations()` retorna 3 recomendações
- [ ] `get_weak_topics()` retorna assuntos fracos
- [ ] `calculate_tri_score()` calcula nota corretamente

---

## 🚨 Problemas Comuns

### Erro: "relation already exists"
**Solução**: Tabela já existe. Tudo bem! Pule para os testes.

### Erro: "function ... already exists"
**Solução**: Use `CREATE OR REPLACE` (já está no script)

### Erro: "permission denied"
**Solução**: Você precisa ser admin do projeto Supabase

### Erro: "syntax error"
**Solução**: 
1. Copie o SQL novamente (pode ter cortado algo)
2. Execute em partes (crie tabelas primeiro, depois funções)

---

## 🎉 Próximos Passos (após tudo funcionar)

1. **Instalar Node.js** (seguir QUICKSTART.md)
2. **Rodar `npm install`**
3. **Configurar `.env.local`** com chaves do Supabase
4. **Testar localmente**: `npm run dev`
5. **Ver o dashboard** com recomendações adaptativas!

---

## 💬 Precisa de Ajuda?

Se algo não funcionar:
1. **Copie a mensagem de erro completa**
2. **Me envie** e eu ajudo a resolver!

**Boa sorte!** 🚀
