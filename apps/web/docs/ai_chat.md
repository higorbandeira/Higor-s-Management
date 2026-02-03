# AI CHAT - Integração LLM

## Objetivo
Este documento descreve a configuração da LLM no mesmo servidor da API e o módulo **AI CHAT** na Web. O módulo foi criado como uma cópia do chat geral, com ajustes para:

- Enviar mensagens com tag própria (`AI_CHAT`).
- Exibir status do processo: **rodando** ou **parado**.
- Responder imediatamente com a LLM ou com a mensagem de limitação quando o conteúdo não for permitido.

## Backend (API)

### Endpoints WebSocket
- `WS /api/ws/ai-chat`: fluxo principal do AI CHAT.

### Variáveis de ambiente
Configure no serviço da API:

- `LLM_PROVIDER`: `openai` ou `ollama`.
- `LLM_API_KEY`: chave da API.
- `LLM_MODEL`: modelo LLM (padrão `gpt-5`).
- `LLM_BASE_URL`: base URL (padrão `https://api.openai.com/v1`).
- `LLM_TIMEOUT_SECONDS`: timeout das chamadas.

#### LLM local (Ollama)
Para rodar a LLM local, use:

- `LLM_PROVIDER=ollama`
- `LLM_BASE_URL=http://ollama:11434`
- `LLM_MODEL=llama3.1` (ou outro modelo disponível)

No Docker local, o serviço `ollama` já está no `docker-compose.yml`. Você pode fazer o pull do
modelo com: `docker exec -it <container_ollama> ollama pull llama3.1`.

### Regras de comportamento
Para manter o chat limitado e seguro, o backend aplica um filtro simples:

1. **Permite apenas mensagens de suporte ao sistema** (ex.: login, cadastro, módulos, ajuda básica).
2. **Qualquer outro assunto** (ex.: futebol, apostas, política ou temas ofensivos) recebe a resposta:

> "Este é um chat limitado e não posso falar sobre esse assunto."

Esse comportamento é reforçado no prompt do modelo.

## Frontend (Web)

### Módulo AI CHAT
O novo módulo aparece no cadastro e edição de usuários com o rótulo **AI CHAT**.

### Status do processo
O cabeçalho do módulo mostra o status enviado pelo servidor:

- **Processo rodando**: LLM em execução.
- **Processo parado**: sem processamento ativo.

## QA e UX
Para testes iniciais:

1. Crie um usuário com o módulo **AI CHAT**.
2. Acesse `/ai-chat`.
3. Envie uma mensagem de suporte (ex.: "Como faço login?").
4. Envie uma mensagem fora do escopo (ex.: "Quem ganhou o jogo ontem?").

Valide:
- A resposta limitada para assuntos fora do escopo.
- O status muda para **rodando** durante a resposta e volta para **parado**.
