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
    timeout = httpx.Timeout(settings.LLM_TIMEOUT_SECONDS)

    if settings.LLM_PROVIDER == "ollama":
        url = f"{settings.LLM_BASE_URL.rstrip('/')}/api/chat"
        payload = {
            "model": settings.LLM_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            if response.status_code >= 400:
                raise LlmError(f"LLM request failed: {response.status_code}")
            data = response.json()
            output_text = (data.get("message") or {}).get("content", "").strip()
            if not output_text:
                raise LlmError("LLM returned empty output.")
            return output_text

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
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code >= 400:
            raise LlmError(f"LLM request failed: {response.status_code}")
        data = response.json()
        output_text = _extract_output_text(data)
        if not output_text:
            raise LlmError("LLM returned empty output.")
        return output_text


async def is_llm_online() -> bool:
    timeout = httpx.Timeout(settings.LLM_TIMEOUT_SECONDS)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if settings.LLM_PROVIDER == "ollama":
                url = f"{settings.LLM_BASE_URL.rstrip('/')}/api/version"
                response = await client.get(url)
                return response.status_code < 400
            if not settings.LLM_API_KEY:
                return False
            url = f"{settings.LLM_BASE_URL.rstrip('/')}/models"
            headers = {"Authorization": f"Bearer {settings.LLM_API_KEY}"}
            response = await client.get(url, headers=headers)
            return response.status_code < 400
    except httpx.HTTPError:
        return False
