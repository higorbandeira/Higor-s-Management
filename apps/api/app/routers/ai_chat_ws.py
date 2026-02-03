from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import ALGORITHM
from app.services.llm_client import generate_ai_reply, is_llm_online, LlmError

router = APIRouter()

connections: set[WebSocket] = set()
ai_chat_state: list[dict[str, Any]] = []

ALLOWED_PATTERNS = [
    re.compile(r"\b(oi|olá|ola|bom dia|boa tarde|boa noite)\b", re.IGNORECASE),
    re.compile(r"\b(ajuda|suporte|como usar|login|cadastro|senha|módulo|modulo|chat|painel|admin)\b", re.IGNORECASE),
]


def _decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


def _is_allowed_message(text: str) -> bool:
    return any(pattern.search(text) for pattern in ALLOWED_PATTERNS)


async def _broadcast(message: dict[str, Any]) -> None:
    dead: list[WebSocket] = []
    for ws in connections:
        try:
            await ws.send_json(message)
        except RuntimeError:
            dead.append(ws)
    for ws in dead:
        connections.discard(ws)


async def _push_message(sender: str, text: str, tag: str) -> None:
    ai_chat_state.append(
        {
            "id": str(uuid4()),
            "sender": sender,
            "text": text.strip(),
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "tag": tag,
        }
    )
    ai_chat_state[:] = ai_chat_state[-200:]
    await _broadcast({"type": "state", "messages": ai_chat_state})


@router.websocket("/ws/ai-chat")
async def ai_chat_ws(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    payload = _decode_token(token)
    if not payload or payload.get("role") not in {"USER", "ADMIN"}:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    connections.add(websocket)
    await websocket.send_json({"type": "state", "messages": ai_chat_state})
    initial_status = "online" if await is_llm_online() else "offline"
    await websocket.send_json({"type": "status", "state": initial_status})

    try:
        while True:
            message = await websocket.receive_json()
            if message.get("type") != "message":
                continue
            payload = message.get("payload") or {}
            sender = payload.get("sender") or "Usuário"
            text = payload.get("text") or ""
            if not text.strip():
                continue

            await _push_message(sender, text, "USER")
            await _broadcast({"type": "status", "state": "processing"})

            limited_reply = "Este é um chat limitado e não posso falar sobre esse assunto."
            reply_text: str
            status_after = "online"
            if not _is_allowed_message(text):
                reply_text = limited_reply
            elif settings.LLM_PROVIDER != "ollama" and not settings.LLM_API_KEY:
                reply_text = "LLM não configurada no servidor."
                status_after = "offline"
            else:
                try:
                    tagged_text = f"[AI_CHAT] {text.strip()}"
                    reply_text = await generate_ai_reply(tagged_text)
                except LlmError:
                    reply_text = (
                        "LLM indisponível no momento. Verifique se o serviço está rodando "
                        "e se o modelo foi baixado."
                    )
                    status_after = "offline"

            await _push_message("AI CHAT", reply_text, "AI")
            await _broadcast({"type": "status", "state": status_after})
    except WebSocketDisconnect:
        connections.discard(websocket)
