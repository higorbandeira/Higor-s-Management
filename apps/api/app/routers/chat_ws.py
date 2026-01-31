from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import ALGORITHM

router = APIRouter()

connections: set[WebSocket] = set()
chat_state: list[dict[str, Any]] = []


def _decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


async def _broadcast(message: dict[str, Any]) -> None:
    dead: list[WebSocket] = []
    for ws in connections:
        try:
            await ws.send_json(message)
        except RuntimeError:
            dead.append(ws)
    for ws in dead:
        connections.discard(ws)


@router.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket) -> None:
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
    await websocket.send_json({"type": "state", "messages": chat_state})

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
            chat_state.append(
                {
                    "id": str(uuid4()),
                    "sender": sender,
                    "text": text.strip(),
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            )
            chat_state[:] = chat_state[-200:]
            await _broadcast({"type": "state", "messages": chat_state})
    except WebSocketDisconnect:
        connections.discard(websocket)
