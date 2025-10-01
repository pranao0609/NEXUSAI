# backend/agents/summarizer/summarizer_agent.py
import httpx
from typing import List, Union
from core.config import settings
from langchain.schema import StrOutputParser  # ✅ output parser

GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_MODEL = settings.GROQ_MODEL


class SummarizerAgent:
    def __init__(self) -> None:
        if not GROQ_API_KEY or GROQ_API_KEY.startswith("your_"):
            raise RuntimeError("❌ GROQ_API_KEY not set in environment")

        # ✅ Initialize output parser
        self.output_parser = StrOutputParser()

    async def summarize(
        self, documents: List[Union[str, dict]], max_points: int = 8
    ) -> List[str]:
        """Summarize docs into bullet points using Groq API."""

        texts: List[str] = [
            (doc.get("content", "").strip() if isinstance(doc, dict) else str(doc).strip())
            for doc in documents if doc
        ]

        if not texts:
            return ["⚠️ No documents to summarize"]

        prompt = f"Summarize the following text into {max_points} concise bullet points:\n\n" + "\n\n".join(texts)

        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You are a summarizer. Respond only with bullet points (no JSON, no extra formatting)."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        try:
            output = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            return [f"⚠️ Unexpected Groq response format: {e}"]

        # ✅ Use StrOutputParser to normalize output into plain string
        parsed_output: str = self.output_parser.parse(output)

        # ✅ Split into bullet list
        bullets = [
            line.strip("-• ").strip()
            for line in parsed_output.splitlines()
            if line.strip()
        ]

        return bullets[:max_points]
