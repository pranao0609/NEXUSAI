import os
import httpx
import json
from typing import List, Dict, Any
from core.config import settings

# Load key from env (fallback hardcoded – not recommended for production)
GROQ_API_KEY=settings.GROQ_API_KEY

GROQ_MODEL = settings.GROQ_MODEL


class AnalyserAgent:
    def __init__(self) -> None:
        if not GROQ_API_KEY or GROQ_API_KEY.startswith("your_"):
            raise RuntimeError("❌ GROQ_API_KEY not set in environment")

    async def analyse(self, points: List[str], title: str, audience: str) -> Dict[str, Any]:
        """Generate structured report from bullet points."""

        # --- Prompt for Groq ---
        prompt = f"""
        Create a structured JSON report with the following keys:
        - introduction (short overview, <= 5 sentences)
        - main_points (list of concise bullets)
        - action_plan (list of steps)
        - concerns (list of potential risks/issues)
        - conclusion (short closing)

        Title: {title}
        Audience: {audience}

        Points: {points}
        """

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You are a structured report generator. Always respond in valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.4,
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

        # ✅ Extract safely
        try:
            raw = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            return {
                "error": f"⚠️ Unexpected Groq response format: {e}",
                "raw_response": data,
                "main_points": points,
            }

        # ✅ Parse JSON safely
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # fallback if model gives plain text instead of JSON
            return {
                "introduction": raw[:300],
                "main_points": points,
                "action_plan": [],
                "concerns": [],
                "conclusion": "See full text above.",
            }
