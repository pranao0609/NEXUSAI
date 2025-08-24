# backend/agents/ingestion/duckduckgo_ingestor.py
from langchain_community.tools import DuckDuckGoSearchRun
from .base_ingestor import BaseIngestor

class DuckDuckGoIngestor(BaseIngestor):
    def fetch(self, query: str):
        search = DuckDuckGoSearchRun()
        result = search.run(query)
        return {"source": "duckduckgo", "content": result}
