# backend/agents/ingestion/wiki_ingestor.py
from langchain_community.document_loaders import WikipediaLoader
from .base_ingestor import BaseIngestor

class WikiIngestor(BaseIngestor):
    def fetch(self, query: str):
        loader = WikipediaLoader(query=query, load_max_docs=2)
        docs = loader.load()
        return [{"source": "wikipedia", "content": d.page_content, "metadata": d.metadata} for d in docs]
