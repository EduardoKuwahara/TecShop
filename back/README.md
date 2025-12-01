# Backend TecShop

Backend da aplicação TecShop, otimizado para funcionar no Vercel como serverless functions.

## 🚀 Configuração para Vercel

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

- `MONGODB_URI`: URL de conexão do MongoDB (ex: `mongodb+srv://user:pass@cluster.mongodb.net/tecshop`)
- `DB_NAME`: Nome do banco de dados
- `JWT_SECRET`: Chave secreta para assinatura de tokens JWT
- `NODE_ENV`: `production` (já configurado automaticamente)

### 2. Como configurar variáveis no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - `MONGODB_URI` → Valor da sua conexão MongoDB
   - `DB_NAME` → Nome do seu banco de dados
   - `JWT_SECRET` → Uma string aleatória e segura

### 3. Deploy

O Vercel detectará automaticamente o arquivo `vercel.json` e configurará o projeto. Para fazer deploy:

```bash
# Se ainda não instalou o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy (na pasta back/)
cd back
vercel
```

### 4. Estrutura

- `src/index.ts`: Arquivo principal da aplicação
- `src/middleware/auth.ts`: Middleware de autenticação
- `views/`: Templates EJS para compartilhamento
- `vercel.json`: Configuração do Vercel

## 🛠️ Desenvolvimento Local

### Instalação

```bash
npm install
```

### Configuração

1. Copie `.env.example` para `.env`
2. Preencha as variáveis de ambiente no arquivo `.env`

### Executar

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## 📝 Notas Importantes

- A conexão MongoDB está otimizada para serverless, reutilizando conexões quando possível
- O backend exporta o app Express como default para compatibilidade com Vercel
- As rotas estão configuradas para funcionar tanto localmente quanto no Vercel
- O arquivo `vercel.json` configura o roteamento para todas as rotas (API e compartilhamento)

## 🔗 Rotas Principais

- `GET /api/health`: Health check
- `POST /api/register`: Registro de usuário
- `POST /api/login`: Login
- `GET /api/ads`: Listar anúncios
- `POST /api/ads`: Criar anúncio (autenticado)
- `GET /share/ad/:slug`: Página de compartilhamento de anúncio

Para mais detalhes, consulte o código em `src/index.ts`.

