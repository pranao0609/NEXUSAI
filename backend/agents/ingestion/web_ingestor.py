# backend/agents/ingestion/web_ingestor.py
import requests
from bs4 import BeautifulSoup
from .base_ingestor import BaseIngestor

class WebIngestor(BaseIngestor):
    def fetch(self, url: str):
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        text = " ".join([p.text for p in soup.find_all("p")])
        return {"source": url, "content": text}
