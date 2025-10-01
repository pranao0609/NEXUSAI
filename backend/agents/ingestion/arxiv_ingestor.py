# backend/agents/ingestion/arxiv_ingestor.py
from langchain_community.document_loaders import ArxivLoader
from .base_ingestor import BaseIngestor

class ArxivIngestor(BaseIngestor):
    def fetch(self, query: str):
        # Limit to 1 paper per query and truncate content to 1000 characters
        loader = ArxivLoader(query=query, load_max_docs=1)
        docs = loader.load()
        return [{
            
            "source": "arxiv", 
            "content": d.page_content[:1000],  # Truncate to first 1000 characters
            "metadata": d.metadata
        } for d in docs]
