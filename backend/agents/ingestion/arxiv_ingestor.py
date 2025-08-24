# backend/agents/ingestion/arxiv_ingestor.py
from langchain_community.document_loaders import ArxivLoader
from .base_ingestor import BaseIngestor

class ArxivIngestor(BaseIngestor):
    def fetch(self, query: str):
        loader = ArxivLoader(query=query, load_max_docs=2)
        docs = loader.load()
        return [{"source": "arxiv", "content": d.page_content, "metadata": d.metadata} for d in docs]
