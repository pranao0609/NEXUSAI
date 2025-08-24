# backend/agents/ingestion/ingestion_agent.py
from .web_ingestor import WebIngestor
from .arxiv_ingestor import ArxivIngestor
from .wiki_ingestor import WikiIngestor
from .duckduckgo_ingestor import DuckDuckGoIngestor

class IngestionAgent:
    def __init__(self):
        self.sources = {
            "web": WebIngestor(),
            "arxiv": ArxivIngestor(),
            "wiki": WikiIngestor(),
            "duckduckgo": DuckDuckGoIngestor(),
        }

    def ingest(self, source: str, query: str):
        if source not in self.sources:
            raise ValueError(f"Source {source} not supported")
        return self.sources[source].fetch(query)
