# backend/agents/analyser/analyser_agent.py

import httpx
import json
from typing import List, Dict, Any, Union
from core.config import settings


GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_MODEL = settings.GROQ_MODEL


class AnalyserAgent:
    """
    AnalyserAgent converts bullet points into a structured report
    using Groq LLM API and enforces a consistent JSON schema.
    """

    def __init__(self) -> None:
        if not GROQ_API_KEY or GROQ_API_KEY.startswith("your_"):
            raise RuntimeError("❌ GROQ_API_KEY is missing or invalid in environment variables")

        self.headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def analyse(
        self, points: List[str], title: str, audience: str
    ) -> Dict[str, Union[str, List[str]]]:
        """
        Generate a structured report JSON object from bullet points.

        Args:
            points (List[str]): Extracted bullet points.
            title (str): Report title.
            audience (str): Target audience.

        Returns:
            Dict[str, Any]: Structured report.
        """

        prompt = f"""
        Generate a structured report as a valid JSON object with the following schema:
        {{
          "introduction": "short overview, <= 5 sentences",
          "main_points": ["point1", "point2", ...],
          "action_plan": ["step1", "step2", ...],
          "concerns": ["risk1", "risk2", ...],
          "conclusion": "short closing remark"
        }}

        Ensure strict JSON formatting without additional commentary.

        Title: {title}
        Audience: {audience}
        Points: {points}
        """

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You are a structured report generator. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            try:
                resp = await client.post(self.endpoint, headers=self.headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
            except httpx.RequestError as e:
                return {"error": f"❌ Request failed: {str(e)}", "main_points": points}
            except httpx.HTTPStatusError as e:
                return {"error": f"❌ Groq API returned {e.response.status_code}: {e.response.text}", "main_points": points}

        # Extract model output
        try:
            raw = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            return {"error": f"⚠️ Unexpected Groq response format: {e}", "main_points": points}

        # Parse JSON safely
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {
                "introduction": raw[:300],
                "main_points": points,
                "action_plan": [],
                "concerns": [],
                "conclusion": "⚠️ Invalid JSON, see introduction.",
            }

        # Enforce schema defaults
        schema = {
            "introduction": "",
            "main_points": [],
            "action_plan": [],
            "concerns": [],
            "conclusion": "",
        }
        return {key: parsed.get(key, default) for key, default in schema.items()}
