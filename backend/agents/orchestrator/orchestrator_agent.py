# agents/orchestrator/orchestrator_agent.py
from typing import Any, Dict, List

from agents.ingestion.ingestion_agent import IngestionAgent
from agents.summarizer.summarizer_agent import SummarizerAgent
from agents.analyser.analyser_agent import AnalyserAgent


class OrchestratorAgent:
    def __init__(self) -> None:
        self.ingestor = IngestionAgent()
        self.summarizer = SummarizerAgent()
        self.analyser = AnalyserAgent()

    async def run_pipeline(
        self, source: str, query: str, title: str, audience: str
    ) -> Dict[str, Any]:
        """
        Run the multi-agent pipeline:
        1. Ingest data
        2. Summarize
        3. Analyse & generate report
        """

        # --- Step 1: Ingest data ---
        try:
            docs: List[str] = self.ingestor.ingest(source, query)

        except Exception as e:
            return {"error": f"Ingestion failed: {e}"}

        if not docs:
            return {"error": "No data ingested"}

        # --- Step 2: Summarize ---
        try:
            points: List[str] = await self.summarizer.summarize(docs, max_points=8)
        except Exception as e:
            return {"error": f"Summarization failed: {e}"}

        if not points:
            return {"error": "No summary points generated"}

        # --- Step 3: Analyse / Report ---
        try:
            report: Dict[str, Any] = await self.analyser.analyse(points, title, audience)
            return report
        except Exception as e:
            return {"error": f"Analysis failed: {e}"}
