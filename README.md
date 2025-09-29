# TecShop

## Visão do Projeto
O TecShop é um aplicativo mobile marketplace para a comunidade Fatec, permitindo que estudantes anunciem produtos, serviços e promoções de forma organizada, segura e intuitiva. O app oferece cadastro, autenticação, publicação, busca, gerenciamento de anúncios e recursos administrativos, com foco em usabilidade e integração mobile.

### Requisitos Funcionais <a name="requisitos"></a>

| RF  | Nome                                    | Descritivo |
|:---:|:----------------------------------------:|:-----------|
| RF1 | Cadastro e Autenticação de Usuários      | CRUD de usuários, autenticação via e-mail institucional ou Google, restrito à comunidade acadêmica. |
| RF2 | Perfil de Usuário                        | Criação e edição de perfil com dados básicos, curso, contato e foto. |
| RF3 | Publicação de Anúncios                   | CRUD de anúncios de produtos/serviços, com título, descrição, categoria, preço, disponibilidade, imagens. |
| RF4 | Listagem e Busca de Anúncios             | Listagem de anúncios em destaque/recentes/populares, busca por palavra-chave, categoria, período, proximidade. |
| RF5 | Visualização Detalhada                   | Exibição detalhada de anúncios, com imagens e informações completas. |
| RF6 | Edição e Exclusão de Anúncios            | Permitir que o autor edite ou exclua seus anúncios. |
| RF7 | Favoritos e Histórico                    | Favoritar anúncios, histórico de anúncios publicados/interações. |
| RF8 | Avaliação e Comentários                  | Avaliar e comentar em anúncios/ofertas. |
| RF9 | Notificações e Alertas                   | Notificações em tempo real sobre novos anúncios, categorias de interesse, promoções. |
| RF10| Compartilhamento e Exportação            | Exportar/compartilhar anúncios via links, redes sociais, apps de mensagem. |
| RF11| Estatísticas de Perfil                   | Exibir número de anúncios, avaliações, interações do usuário. |
| RF12| Modo Offline Parcial                     | Visualizar anúncios já carregados sem conexão. |
| RF13| Moderação e Denúncias                    | Moderação de conteúdo, denúncias de anúncios suspeitos. |
| RF14| Promoções e Destaques                    | Seção de promoções/destaques semanais. |

### Requisitos Não Funcionais

| RNF  | Nome |
|:----:|:-----|
| RNF1 | Interface intuitiva, responsiva e adaptável |
| RNF2 | Segurança dos dados e autenticação |
| RNF3 | Performance (carregamento rápido, busca eficiente) |
| RNF4 | Compatibilidade Android/iOS |
| RNF5 | Disponibilidade parcial offline |



---

## 📜 Product Backlog <a name="backlog"></a>

| RANK | SPRINT | PRIORIDADE | ESTIMATIVA | USER STORY (NOME) | STATUS |
|:----:|:------:|:----------:|:----------:|:------------------|:------:|
| 1    |   1    |   Alta     |     5      | Como usuário, quero me cadastrar e autenticar para acessar o app. |        |
| 2    |   1    |   Alta     |     3      | Como usuário, quero criar e editar meu perfil com dados básicos. |        |
| 3    |   1    |   Alta     |     5      | Como usuário, quero publicar, editar e excluir anúncios de produtos/serviços. |        |
| 4    |   1    |   Alta     |     5      | Como usuário, quero visualizar uma lista de anúncios em destaque/recentes. |        |
| 5    |   2    |   Alta     |     5      | Como usuário, quero buscar anúncios por palavra-chave, categoria, período e proximidade. |        |
| 6    |   2    |   Alta     |     3      | Como usuário, quero favoritar anúncios e acessar meu histórico. |        |
| 7    |   2    |   Média    |     5      | Como usuário, quero visualizar detalhes completos dos anúncios, com imagens. |        |
| 8    |   2    |   Média    |     5      | Como usuário, quero avaliar e comentar em anúncios/ofertas. |        |
| 9    |   3    |   Média    |     8      | Como usuário, quero receber notificações em tempo real sobre novidades e promoções. |        |
| 10   |   3    |   Média    |     3      | Como usuário, quero compartilhar anúncios via links e redes sociais. |        |
| 11   |   3    |   Média    |     5      | Como usuário, quero acessar estatísticas do meu perfil. |        |
| 12   |   3    |   Média    |     5      | Como usuário, quero acessar anúncios já carregados mesmo offline. |        |
| 13   |   3    |   Média    |     5      | Como usuário, quero denunciar anúncios suspeitos e contar com moderação. |        |
| 14   |   3    |   Média    |     5      | Como usuário, quero visualizar promoções e destaques semanais. |        |

---

## Pré-requisitos

- Node.js (recomendado: 18.x ou superior)
- npm (geralmente instalado junto com o Node.js)
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local ou Atlas)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoKuwahara/TecShop.git
cd TecShop
```

### 2. Instale as dependências do backend

```bash
cd back
npm install
```

### 3. Instale as dependências do frontend

```bash
cd ../front
npm install
```

## Configuração

### Backend

- Renomeie o arquivo `.env.example` para `.env` (se existir) e configure as variáveis de ambiente:
  - `MONGODB_URI` (string de conexão do MongoDB)
  - `JWT_SECRET` (chave secreta para autenticação)
- Por padrão, o backend roda na porta 3001.

### Frontend

- No arquivo `src/screens/CreateAdScreen.tsx` e outros arquivos que usam o IP do backend, altere a constante `IP_DA_SUA_MAQUINA` para o IP da sua máquina na rede local (ex: `192.168.0.10`).
- Certifique-se de que o dispositivo móvel/emulador pode acessar esse IP.

## Como rodar o projeto

### 1. Inicie o backend

```bash
cd back
npm run dev
```

### 2. Inicie o frontend (Expo)

```bash
cd ../front
npx expo start
```

- Use o app Expo Go no seu celular para escanear o QR code e rodar o app, ou use um emulador Android/iOS.

## Scripts úteis

- `npm run dev` (backend): inicia o servidor Express com hot reload
- `npx expo start` (frontend): inicia o servidor de desenvolvimento Expo

## Estrutura do projeto

```
TecShop/
  back/        # Backend Node.js/Express
  front/       # Frontend React Native (Expo)
```

## Licença

MIT
