# Higor - Central de Módulos IA (React + FastAPI)

## Visão geral
Este repositório concentra múltiplos módulos com **login único**, permissões por papel e redirecionamento automático para o módulo correto. A base evolui continuamente para suportar novos fluxos operacionais.

## O que já está pronto
- Login por **nickname + senha** (único para todos os módulos)
- Roles: **USER** e **ADMIN**
- Redirecionamento automático para o módulo do usuário (CHAT, DASHBOARD ou PDV)
- Admin: lista/cria USER, edita nickname, ativa/inativa, reseta senha e define módulo
- Chat geral em tempo real (WebSocket)
- Dashboard de campo RPG com upload de assets (MAP/AVATAR)
- Módulo PDV com rotinas de frente de caixa e atalhos operacionais
- Refresh token em cookie HttpOnly, armazenado como hash no Postgres
- `nickname_norm` para unicidade (trim + collapse espaços + lowercase)
- Docker Compose local e template de deploy via Terraform (AWS EC2 exemplo)

## Módulos
- **apps/web**: Interface principal com Chat, Dashboard e PDV.
- **apps/api**: API e autenticação compartilhada.

## Documentação por módulo
A documentação geral e os direcionadores de IA ficam no módulo principal:
- `apps/web/docs/`

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

## Rotas
- `/login`
- `/chat` (USER)
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

## Próximos passos (evolução sugerida)
1) Painel PDV com fluxo completo de venda (itens, estoque, descontos e formas de pagamento).
2) Dashboard RPG com canvas 2D, camadas e ferramentas de mestre.
3) Chat com histórico persistente, canais e moderação.
4) Relatórios administrativos (vendas, uso por módulo, auditoria).
5) Observabilidade (logs estruturados, alertas e métricas).
