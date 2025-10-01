# backend/agents/ingestion/ingestion_agent.py
from .arxiv_ingestor import ArxivIngestor
from .wiki_ingestor import WikiIngestor
from .csv_ingestion import CSVIngestor  
from .pdf_ingestor import PDFIngestionAgent

class IngestionAgent:
    def __init__(self):
        self.sources = {
            "arxiv": ArxivIngestor(),
            "wiki": WikiIngestor(),
            "csv": CSVIngestor(),
            "pdf":PDFIngestionAgent()
        }

    def ingest(self, source: str, query: str):
        if source not in self.sources:
            raise ValueError(f"Source {source} not supported")
        return self.sources[source].fetch(query)
