# 🚀 Guia Rápido de Instalação - ENEM FLASH

## ✅ Passo 1: Instalar Node.js

### Você precisa instalar Node.js primeiro!

1. **Abra o navegador** e acesse: https://nodejs.org/

2. **Download**:
   - Clique no botão **verde grande** escrito "LTS" (versão recomendada)
   - Versão atual: Node.js 20.x LTS

3. **Instalar**:
   - Execute o arquivo baixado (`.msi`)
   - Clique "Next" em todas as telas
   - ✅ Marque a opção: "Automatically install necessary tools"
   - Aguarde a instalação (pode demorar 2-3 minutos)

4. **Verificar** (abra novo PowerShell):
   ```powershell
   node --version
   npm --version
   ```
   
   Deve aparecer algo como:
   ```
   v20.11.0
   10.2.4
   ```

---

## 📦 Passo 2: Instalar Dependências do Projeto

**Após instalar Node.js**, execute:

```powershell
cd "C:\Users\1741643\OneDrive\Área de Trabalho\Alimercados"
npm install
```

Isso vai instalar (~2 minutos):
- Next.js
- React
- Supabase
- TailwindCSS
- TypeScript
- Recharts
- Cheerio

---

## 🗄️ Passo 3: Configurar Supabase (Banco de Dados)

### 3.1 Criar Conta

1. Acesse: https://supabase.com
2. Clique **"Start your project"**
3. Login com **GitHub** (mais rápido)

### 3.2 Criar Projeto

1. Clique **"New Project"**
2. Preencha:
   - **Name**: `enem-flash`
   - **Database Password**: escolha uma senha forte (anote!)
   - **Region**: `South America (São Paulo)`
3. Clique **"Create new project"**
4. Aguarde 1-2 minutos (criando banco)

### 3.3 Aplicar Schema (Criar Tabelas)

1. No menu lateral: **SQL Editor**
2. Clique **"New query"**
3. Abra o arquivo: `supabase/schema.sql`
4. **Copie TODO o conteúdo** e cole no SQL Editor
5. Clique **"Run"** (botão verde)
6. ✅ Deve aparecer: "Success. No rows returned"

### 3.4 Pegar as Chaves

1. Menu lateral: **Project Settings** (ícone engrenagem)
2. Aba: **API**
3. Copie (você vai usar no próximo passo):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (chave grande)
   - **service_role**: `eyJhbGc...` (outra chave grande - SECRETA!)

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` (copie do `.env.local.example`)

2. Cole as chaves do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO-AQUI.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=qualquer-senha-aleatoria-123
```

**⚠️ IMPORTANTE**: 
- Substitua `SEU-PROJETO-AQUI` pela URL que você copiou
- Cole as chaves completas (são muito longas, normal!)
- `CRON_SECRET` pode ser qualquer senha que você inventar

---

## 🧪 Passo 5: Rodar Localmente

```powershell
npm run dev
```

Aguarde aparecer:
```
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

**Abra no navegador**: http://localhost:3000

### ✅ Testar:

1. **Criar conta**:
   - Email: `teste@aluno.com`
   - Senha: `123456`
   - Nome: Seu nome
   - Tipo: Aluno

2. **Dashboard deve aparecer** com:
   - XP = 0
   - Nível = 1
   - Gráfico vazio

3. **Jogar um simulador**:
   - Físico-Química → Termoquímica
   - Fazer reação
   - Voltar ao dashboard
   - ✅ XP deve ter aumentado!

---

## 🌐 Passo 6: Deploy no Vercel (Colocar Online)

### 6.1 Criar Conta Vercel

1. Acesse: https://vercel.com
2. **"Sign Up"** com GitHub

### 6.2 Criar Repositório GitHub

**No GitHub**:
1. https://github.com/new
2. Nome: `enem-flash`
3. **Create repository**

**No seu computador**:
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU-USUARIO/enem-flash.git
git branch -M main
git push -u origin main
```

### 6.3 Deploy no Vercel

1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. **"Import"** seu repo `enem-flash`
3. **Environment Variables** (adicione as MESMAS do `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   CRON_SECRET = sua-senha
   ```
4. **Deploy** 🚀

Aguarde 2-3 minutos... ✅ **Deploy concluído!**

Seu site estará em: `https://enem-flash.vercel.app`

---

## 🎉 Pronto!

Seu ENEM FLASH está funcionando! 🚀

**Links úteis**:
- 🌐 Site: https://seu-projeto.vercel.app
- 🗄️ Banco: https://seu-projeto.supabase.co
- 📊 Vercel: https://vercel.com/dashboard

**Próximos passos**:
- Adicionar conteúdo (questões ENEM)
- Convidar alunos e professores
- Compartilhar nas redes sociais!

---

## 🆘 Problemas Comuns

### "npm: command not found"
→ Reinicie o PowerShell após instalar Node.js

### "Module not found"
→ Execute: `npm install` novamente

### "Supabase connection failed"
→ Verifique se copiou as chaves corretas no `.env.local`

### Bot não funciona
→ Normal! Só funciona em produção (Vercel)
→ Para testar: `npm run scraper`

---

**Precisa de ajuda?** Me chame! 💬
