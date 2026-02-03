# Higor - Central de Módulos IA (React + FastAPI)

## Visão geral
Este repositório concentra múltiplos módulos com **login único**, permissões por papel e redirecionamento automático para o módulo correto. A base evolui continuamente para suportar novos fluxos operacionais.

## Módulos atuais
### Apps
- **apps/web**: Interface principal (SPA) com Chat, AI CHAT, Dashboard RPG, PDV e Admin.
- **apps/api**: API FastAPI com autenticação, administração, uploads, WebSockets e integração LLM.

### Infra
- **docker-compose.yml**: ambiente local completo (web + api + postgres).
- **infra/**: template de deploy via Terraform (AWS EC2 exemplo).

## Funcionalidades atuais
### Autenticação e acesso
- Login por **nickname + senha** (único para todos os módulos).
- Roles: **USER** e **ADMIN**.
- Refresh token em cookie HttpOnly, armazenado como hash no Postgres.
- `nickname_norm` para unicidade (trim + collapse espaços + lowercase).

### Navegação e permissão
- Redirecionamento automático para o módulo do usuário (CHAT, AI_CHAT, DASHBOARD ou PDV).
- Controle de acesso para rotas administrativas.

### Administração (Admin)
- Lista e criação de usuários.
- Edição de nickname.
- Ativação/inativação de usuário.
- Reset de senha.
- Definição do módulo padrão do usuário.

### Chat (Geral)
- Chat em tempo real via WebSocket.

### AI CHAT
- Módulo dedicado com LLM rodando no mesmo servidor, status de execução e respostas imediatas.

### Dashboard RPG (Campo)
- Upload de assets (MAP/AVATAR).
- Tabuleiro com mapas, avatares e ajustes básicos de posição.

### PDV
- Rotinas de frente de caixa com atalhos operacionais.

## Documentação por módulo
A documentação geral e os direcionadores de IA ficam no módulo principal:
- `apps/web/docs/`
  - `apps/web/docs/ai_chat.md` (AI CHAT + integração LLM)

## Rodar local (Docker)
```bash
docker compose up --build
```
Acesse:
- Web: http://localhost:3000
- API: http://localhost:8000 (Nginx usa /api)

Bootstrap do ADMIN (dev) vem no `docker-compose.yml`:
- Nickname: `Admin Master`
- Senha: `admin123`

## Deploy gratuito (Render)
Uma opção simples e gratuita é usar o **Render** com três serviços: Postgres, API (Docker) e Web (Docker). Como a Web vai falar com a API por domínio público, você precisa configurar as variáveis abaixo para CORS e cookies.

### 1) Banco de dados (Render Postgres)
Crie um Postgres gratuito no Render e copie a `Internal Database URL` para usar na API.

### 2) Serviço da API (Docker)
Crie um **Web Service** apontando para este repositório com o diretório `apps/api` e Dockerfile.

**Variáveis de ambiente sugeridas (produção):**
- `ENV=prod`
- `DATABASE_URL=<INTERNAL_DATABASE_URL>`
- `JWT_SECRET=<string_forte>`
- `ACCESS_MINUTES=15`
- `REFRESH_DAYS=30`
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`
- `CORS_ORIGINS=https://<sua-web>.onrender.com`
- `BOOTSTRAP_ADMIN_ENABLED=true`
- `BOOTSTRAP_ADMIN_NICKNAME=Admin Master`
- `BOOTSTRAP_ADMIN_PASSWORD=<senha_forte>`
- `LLM_API_KEY=<sua_chave_api>`
- `LLM_MODEL=gpt-5`
- `LLM_BASE_URL=https://api.openai.com/v1`
- `LLM_TIMEOUT_SECONDS=30`

> Observação: `COOKIE_SAMESITE=none` exige HTTPS, por isso `COOKIE_SECURE=true`.

### 3) Serviço da Web (Docker)
Crie outro **Web Service** apontando para o diretório `apps/web`.

**Variáveis de ambiente sugeridas:**
- `VITE_API_BASE_URL=https://<sua-api>.onrender.com/api`

### 4) Ajustes finais
- Aguarde o build terminar e teste o login no endereço da Web.
- Se usar domínios customizados, atualize `CORS_ORIGINS` e `VITE_API_BASE_URL`.

## Rotas
- `/login`
- `/chat` (USER)
- `/ai-chat` (USER)
- `/dashboard` (USER)
- `/pdv` (USER)
- `/admin/users` (ADMIN)
- `/admin/users/:id` (ADMIN)

## API (prefixo /api)
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- GET  `/api/auth/me`
- POST `/api/auth/logout`
- GET  `/api/admin/users`
- POST `/api/admin/users`
- GET  `/api/admin/users/{id}`
- PATCH `/api/admin/users/{id}`
- GET  `/api/assets`
- POST `/api/assets/upload`
- WS  `/api/ws/chat`
- WS  `/api/ws/ai-chat`

## Próximos passos (evolução sugerida)
1) Painel PDV com fluxo completo de venda (itens, estoque, descontos e formas de pagamento).
2) Dashboard RPG com canvas 2D, camadas e ferramentas de mestre.
3) Chat com histórico persistente, canais e moderação.
4) Relatórios administrativos (vendas, uso por módulo, auditoria).
5) Observabilidade (logs estruturados, alertas e métricas).
