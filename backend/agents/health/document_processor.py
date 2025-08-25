# agents/health/document_processor.py
import logging
import re
import uuid
from typing import List, Dict, Any
import PyPDF2

from config.settings import settings
from agents.health.qdrant_client import qdrant_client

logger = logging.getLogger(__name__)

class HealthDocumentProcessor:
    def __init__(self):
        pass
        
    async def initialize(self):
        """Initialize document processor"""
        try:
            return True
        except Exception as e:
            logger.error(f"Failed to initialize document processor: {e}")
            return False
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF document"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                full_text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text:
                        full_text += f"Page {page_num+1}: {text}\n\n"
            return full_text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise
    
    def chunk_text(self, text: str, chunk_size: int = None, 
                  chunk_overlap: int = None) -> List[Dict[str, Any]]:
        """Split text into meaningful chunks with metadata"""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
        
        # Split by sentences first
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = ""
        chunk_id = 0
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += sentence + " "
            else:
                if current_chunk:
                    chunks.append({
                        "id": str(uuid.uuid4()),
                        "text": current_chunk.strip(),
                        "chunk_index": chunk_id,
                        "source": "pdf_extraction",
                        "metadata": {
                            "chunk_size": len(current_chunk),
                            "contains_medical_terms": self._contains_medical_terms(current_chunk)
                        }
                    })
                    chunk_id += 1
                
                # Keep overlap from previous chunk
                overlap_start = max(0, len(current_chunk) - chunk_overlap)
                current_chunk = current_chunk[overlap_start:] + sentence + " "
        
        # Add the last chunk
        if current_chunk:
            chunks.append({
                "id": str(uuid.uuid4()),
                "text": current_chunk.strip(),
                "chunk_index": chunk_id,
                "source": "pdf_extraction",
                "metadata": {
                    "chunk_size": len(current_chunk),
                    "contains_medical_terms": self._contains_medical_terms(current_chunk)
                }
            })
        
        return chunks
    
    def _contains_medical_terms(self, text: str) -> bool:
        """Simple check for medical terms in text"""
        medical_keywords = [
            'patient', 'treatment', 'diagnosis', 'symptoms', 'medication',
            'dose', 'therapy', 'clinical', 'hospital', 'doctor', 'nurse',
            'blood', 'pressure', 'heart', 'lung', 'kidney', 'liver'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in medical_keywords)
    
    async def process_and_store_documents(self, pdf_path: str) -> bool:
        """Process PDF and store chunks in Qdrant"""
        try:
            # Extract text
            text = self.extract_text_from_pdf(pdf_path)
            
            # Chunk text
            chunks = self.chunk_text(text)
            
            # Store in Qdrant
            success = await qdrant_client.store_documents(chunks)
            
            logger.info(f"Processed {len(chunks)} chunks from {pdf_path}")
            return success
            
        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            return False
    
    async def search_health_documents(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """Search health documents"""
        top_k = top_k or settings.TOP_K_RESULTS
        
        try:
            # Get semantic search results
            semantic_results = await qdrant_client.search_similar(query, top_k)
            
            return semantic_results
            
        except Exception as e:
            logger.error(f"Document search failed: {e}")
            return []

# Global document processor instance
document_processor = HealthDocumentProcessor()