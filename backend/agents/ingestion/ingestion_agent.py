# backend/agents/ingestion/ingestion_agent.py
from .web_ingestor import WebIngestor
from .arxiv_ingestor import ArxivIngestor
from .wiki_ingestor import WikiIngestor
from .csv_ingestion import CSVIngestor  

class IngestionAgent:
    def __init__(self):
        self.sources = {
            "web": WebIngestor(),
            "arxiv": ArxivIngestor(),
            "wiki": WikiIngestor(),
            "csv": CSVIngestor(),
        }

    def ingest(self, source: str, query: str):
        if source not in self.sources:
            raise ValueError(f"Source {source} not supported")
        return self.sources[source].fetch(query)
