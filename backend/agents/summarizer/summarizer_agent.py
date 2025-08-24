import os
import httpx
from typing import List, Union
from core.config import settings

# Load from env if possible, else fallback (not recommended for prod)
GROQ_API_KEY = settings.GROQ_API_KEY

GROQ_MODEL = settings.GROQ_MODEL


class SummarizerAgent:
    def __init__(self) -> None:
        if not GROQ_API_KEY or GROQ_API_KEY.startswith("your_"):
            raise RuntimeError("❌ GROQ_API_KEY not set in environment")

    async def summarize(
        self, documents: List[Union[str, dict]], max_points: int = 8
    ) -> List[str]:
        """Summarize docs into bullet points using Groq."""

        # --- Normalize documents ---
        texts: List[str] = []
        for doc in documents:
            if isinstance(doc, dict):
                texts.append(doc.get("content", "").strip())
            elif isinstance(doc, str):
                texts.append(doc.strip())

        if not texts:
            return ["⚠️ No documents to summarize"]

        # --- Build prompt ---
        text = "\n\n".join(texts)
        prompt = f"Summarize the following text into {max_points} concise bullet points:\n\n{text}"

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You are a summarizer. Respond only with bullet points."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
        }

        # --- Call Groq API ---
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        # ✅ Groq follows OpenAI schema → choices[0].message.content
        try:
            output = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            return [f"⚠️ Unexpected Groq response format: {e}"]

        # --- Convert output into bullet list ---
        bullets = [
            line.strip("-• ").strip()
            for line in output.splitlines()
            if line.strip()
        ]

        return bullets[:max_points]
