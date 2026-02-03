from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


SYSTEM_PROMPT = (
    "Você é um assistente de chat limitado para suporte básico do sistema. "
    "Se o usuário pedir assuntos fora de ajuda do sistema, ou temas ofensivos, "
    "sensíveis ou potencialmente problemáticos, responda apenas com: "
    "\"Este é um chat limitado e não posso falar sobre esse assunto.\""
)


class LlmError(RuntimeError):
    pass


def _extract_output_text(payload: dict[str, Any]) -> str:
    outputs = payload.get("output") or []
    texts: list[str] = []
    for item in outputs:
        for content in item.get("content") or []:
            if content.get("type") == "output_text":
                texts.append(content.get("text", ""))
    return "\n".join(texts).strip()


async def generate_ai_reply(message: str) -> str:
    if not settings.LLM_API_KEY:
        return "LLM não configurada no servidor."

    url = f"{settings.LLM_BASE_URL.rstrip('/')}/responses"
    headers = {"Authorization": f"Bearer {settings.LLM_API_KEY}"}
    payload = {
        "model": settings.LLM_MODEL,
        "input": [
            {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
            {"role": "user", "content": [{"type": "text", "text": message}]},
        ],
        "temperature": 0.2,
    }
    timeout = httpx.Timeout(settings.LLM_TIMEOUT_SECONDS)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code >= 400:
            raise LlmError(f"LLM request failed: {response.status_code}")
        data = response.json()
        output_text = _extract_output_text(data)
        if not output_text:
            raise LlmError("LLM returned empty output.")
        return output_text
