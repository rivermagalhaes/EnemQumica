# ENEM FLASH - Guia de Deployment Completo 🚀

## Estrutura Criada

```
📁 Alimercados/
├── 📄 package.json              # Dependencies
├── 📄 next.config.js            # Next.js config
├── 📄 tsconfig.json             # TypeScript config
├── 📄 tailwind.config.js        # TailwindCSS config
├── 📄 vercel.json               # Deployment + Cron
├── 📄 .env.local.example        # Environment template
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 dashboard/
│   │   │   ├── 📁 student/      # ✅ Student Dashboard
│   │   │   └── 📁 teacher/      # ✅ Teacher Dashboard
│   │   └── 📁 api/
│   │       └── 📁 enem-scraper/ # ✅ Bot API
│   ├── 📁 components/
│   │   └── 📁 dashboard/        # ✅ Reusable components
│   └── 📁 lib/
│       └── 📁 supabase/          # ✅ Database client
├── 📁 scripts/
│   └── 📄 enem-scraper.ts       # ✅ Bot script
└── 📁 supabase/
    └── 📄 schema.sql            # ✅ Database schema
```

## 📋 Passo 1: Instalar Node.js

1. **Download**: https://nodejs.org/
2. **Versão**: LTS (20.x ou superior)
3. **Verificar instalação**:
   ```powershell
   node --version
   npm --version
   ```

## 📦 Passo 2: Instalar Dependências

```powershell
cd "C:\Users\1741643\OneDrive\Área de Trabalho\Alimercados"
npm install
```

Isso instalará:
- Next.js 14
- React
- Supabase client
- Recharts (gráficos)
- Cheerio (web scraping)
- TypeScript
- TailwindCSS

## 🗄️ Passo 3: Configurar Supabase

### 3.1 Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. **Sign Up** (pode usar GitHub)
3. **New Project**
   - Nome: `enem-flash`
   - Database Password: (anote!)
   - Região: `South America (São Paulo)`

### 3.2 Aplicar Schema

1. No Dashboard Supabase: **SQL Editor**
2. **New Query**
3. Copie conteúdo de `supabase/schema.sql`
4. **Run** (executar)

Isso criará:
- ✅ 9 tabelas
- ✅ Indexes
- ✅ RLS policies
- ✅ Triggers

### 3.3 Pegar Credenciais

No Project Settings → API:
- **Project URL**: `https://xxx.supabase.co`
- **anon public key**: `eyJh...`
- **service_role key**: `eyJh...` (secret!)

## 🔐 Passo 4: Configurar Variáveis de Ambiente

1. Copie o template:
   ```powershell
   cp .env.local.example .env.local
   ```

2. Edite `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CRON_SECRET=gere-uma-senha-aleatoria-aqui
   ```

## 🧪 Passo 5: Testar Localmente

```powershell
npm run dev
```

Acesse: http://localhost:3000

**Testes**:
1. ✅ Landing page carrega
2. ✅ Pode criar conta
3. ✅ Dashboard do aluno aparece
4. ✅ Simuladores funcionam
5. ✅ Professor pode criar turma

## 🌐 Passo 6: Deploy no Vercel

### 6.1 Criar Conta Vercel

1. Acesse [vercel.com](https://vercel.com)
2. **Sign Up** com GitHub

### 6.2 Push para GitHub

```powershell
git init
git add .
git commit -m "Initial commit: ENEM FLASH full-stack"
git remote add origin https://github.com/SEU-USUARIO/enem-flash.git
git push -u origin main
```

### 6.3 Import no Vercel

1. Vercel Dashboard → **Add New** → **Project**
2. **Import** do GitHub repo
3. Configure:
   - Framework: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   CRON_SECRET=sua-senha
   ```

5. **Deploy** 🚀

### 6.4 Configurar Domínio Custom (Opcional)

Vercel → Project Settings → Domains
- Adicione: `enemflash.com.br`
- Configure DNS

## 🤖 Passo 7: Ativar Bot ENEM

Bot já está configurado em `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/enem-scraper",
    "schedule": "0 */6 * * *"
  }]
}
```

**Executar manualmente**:
```powershell
# Local (dev)
npm run scraper

# Production
curl -X POST https://seu-site.vercel.app/api/enem-scraper \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

**Logs**:
- Vercel Dashboard → Project → **Deployments** →  **Function Logs**

## ✅ Verificação Final

### Checklist de Deployment

- [ ] Site acessível (seu-projeto.vercel.app)
- [ ] Signup/Login funciona
- [ ] Dashboard aluno carrega com dados
- [ ] Dashboard professor mostra turmas
- [ ] Simuladores salvam progresso no Supabase
- [ ] Bot ENEM roda sem erros
- [ ] Notícias aparecem (se houver)

### Testar Sistema Completo

1. **Criar conta aluno**:
   - Email: `aluno@test.com`
   - Jogar simulador
   - Verificar XP aumentou

2. **Criar conta professor**:
   - Email: `prof@test.com`
   - Criar turma → pegar código
   - Aluno entrar com código
   - Verificar aluno aparece na lista

3. **Verificar banco de dados**:
   - Supabase → Table Editor
   - Ver registros em `users`, `user_progress`, `simulator_sessions`

## 🐛 Troubleshooting

### Erro: "Module not found"
```powershell
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Supabase connection failed"
- Verificar `.env.local` está correto
- Copiar keys novamente do Supabase Dashboard

### Erro: "RLS policy violation"
- Verificar schema aplicado corretamente
- Checar se usuário está autenticado

### Bot não roda
- Verificar `CRON_SECRET` no Vercel
- Checar Function Logs para erros
- Teste manual com POST

## 📊 Monitoramento

### Vercel Analytics
Project → **Analytics** → ativar

### Supabase Logs
Project → **Logs** → ver queries

### Performance
- Lighthouse score
- Vercel Speed Insights

## 🔒 Segurança

### Checklist

- [x] RLS habilitado em todas tabelas
- [x] Service role key apenas no servidor
- [x] CRON_SECRET configurado
- [x] HTTPS obrigatório (Vercel automático)
- [ ] Rate limiting (futuro)
- [ ] Cloudflare (DDos protection - futuro)

## 📈 Próximos Passos

1. **Conteúdo**:
   - Adicionar questões ENEM reais
   - Criar quizzes
   - Videos educacionais

2. **Features**:
   - Notificações push
   - Certificados
   - Ranking global

3. **Marketing**:
   - SEO otimização
   - Redes sociais
   - Parcerias escolas

---

## 🎉 Parabéns!

Seu ENEM FLASH está no ar! 🚀

- 🌐 Frontend moderno (Next.js + React)
- 🗄️ Backend escalável (Supabase)
- 📊 Dashboards analíticos
- 🤖 Bot automático de conteúdo
- ☁️ Deploy profissional (Vercel)

**URL de Produção**: https://seu-projeto.vercel.app

---

*Implementado em 30/01/2026*
