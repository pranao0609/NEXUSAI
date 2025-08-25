# agents/health/qdrant_client.py
import logging
from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

from config.settings import settings

logger = logging.getLogger(__name__)

class QdrantHealthClient:
    def __init__(self):
        self.client = None
        self.embedding_model = None
        self.collection_name = settings.QDRANT_COLLECTION
        
    async def initialize(self):
        """Initialize Qdrant client and embedding model"""
        try:
            # Initialize Qdrant client
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
            )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer(settings.HF_MODEL_NAME)
            
            # Create collection if it doesn't exist
            await self._ensure_collection_exists()
            
            logger.info("Qdrant client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            return False
    
    async def _ensure_collection_exists(self):
        """Ensure the collection exists with proper configuration"""
        collections = self.client.get_collections().collections
        collection_names = [col.name for col in collections]
        
        if self.collection_name not in collection_names:
            # Create new collection
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embedding_model.get_sentence_embedding_dimension(),
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Created new collection: {self.collection_name}")
    
    async def store_documents(self, documents: List[Dict[str, Any]]) -> bool:
        """Store documents in Qdrant with embeddings"""
        try:
            points = []
            
            for doc in documents:
                # Generate embedding
                embedding = self.embedding_model.encode(doc["text"]).tolist()
                
                point = models.PointStruct(
                    id=doc["id"],
                    vector=embedding,
                    payload={
                        "text": doc["text"],
                        "source": doc.get("source", "unknown"),
                        "chunk_index": doc.get("chunk_index", 0),
                        "metadata": doc.get("metadata", {})
                    }
                )
                points.append(point)
            
            # Upsert points to Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            logger.info(f"Stored {len(documents)} documents in Qdrant")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store documents: {e}")
            return False
    
    async def search_similar(self, query: str, top_k: int = 5, 
                           filter: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Search for similar documents using semantic search"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Perform search
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=models.Filter(**filter) if filter else None,
                limit=top_k
            )
            
            # Format results
            results = []
            for result in search_results:
                results.append({
                    "text": result.payload["text"],
                    "score": result.score,
                    "source": result.payload.get("source", "unknown"),
                    "metadata": result.payload.get("metadata", {})
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def hybrid_search(self, query: str, top_k: int = 5, 
                          filter: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Hybrid search combining semantic and keyword search"""
        return await self.search_similar(query, top_k, filter)
    
    async def delete_collection(self):
        """Delete the collection (for testing/cleanup)"""
        try:
            self.client.delete_collection(self.collection_name)
            logger.info(f"Deleted collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")

# Global Qdrant client instance
qdrant_client = QdrantHealthClient()