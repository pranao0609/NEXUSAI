# backend/agents/ingestion/base_ingestor.py
from abc import ABC, abstractmethod

class BaseIngestor(ABC):
    @abstractmethod
    def fetch(self, query: str):
        """Fetch and return documents for a given query"""
        pass
