# agents/education/document_processor.py
import logging
import re
import uuid
from typing import List, Dict, Any
import PyPDF2
from sentence_transformers import SentenceTransformer

from config.settings import settings
from agents.health.qdrant_client import qdrant_client  # Reuse existing Qdrant client

logger = logging.getLogger(__name__)

class EducationDocumentProcessor:
    def __init__(self):
        self.embedding_model = None
        
    async def initialize(self):
        """Initialize document processor"""
        try:
            self.embedding_model = SentenceTransformer(settings.HF_MODEL_NAME)
            return True
        except Exception as e:
            logger.error(f"Failed to initialize education document processor: {e}")
            return False
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from educational PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                full_text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text:
                        # Add page context for educational content
                        full_text += f"## Page {page_num+1} ##\n{text}\n\n"
                return full_text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise
    
    def chunk_educational_content(self, text: str, chunk_size: int = 800) -> List[Dict[str, Any]]:
        """Split educational content into meaningful chunks"""
        # Split by sections, headings, or paragraphs
        sections = re.split(r'(?:\n\s*){2,}', text)  # Split by multiple newlines
        
        chunks = []
        chunk_id = 0
        
        for section in sections:
            if not section.strip():
                continue
                
            # Further split large sections
            if len(section) > chunk_size:
                sentences = re.split(r'(?<=[.!?])\s+', section)
                current_chunk = ""
                
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) <= chunk_size:
                        current_chunk += sentence + " "
                    else:
                        if current_chunk.strip():
                            chunks.append(self._create_chunk(current_chunk.strip(), chunk_id))
                            chunk_id += 1
                        current_chunk = sentence + " "
                
                if current_chunk.strip():
                    chunks.append(self._create_chunk(current_chunk.strip(), chunk_id))
                    chunk_id += 1
            else:
                chunks.append(self._create_chunk(section.strip(), chunk_id))
                chunk_id += 1
        
        return chunks
    
    def _create_chunk(self, text: str, chunk_id: int) -> Dict[str, Any]:
        """Create a standardized chunk with metadata"""
        return {
            "id": str(uuid.uuid4()),
            "text": text,
            "chunk_index": chunk_id,
            "source": "educational_content",
            "metadata": {
                "chunk_size": len(text),
                "contains_concepts": self._contains_educational_concepts(text),
                "difficulty_level": self._estimate_difficulty(text)
            }
        }
    
    def _contains_educational_concepts(self, text: str) -> bool:
        """Check if text contains educational concepts"""
        educational_keywords = [
            'definition', 'concept', 'theory', 'principle', 'example',
            'exercise', 'problem', 'solution', 'method', 'technique',
            'algorithm', 'formula', 'equation', 'theorem', 'proof'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in educational_keywords)
    
    def _estimate_difficulty(self, text: str) -> str:
        """Estimate difficulty level of educational content"""
        text_lower = text.lower()
        
        # Simple heuristic based on content characteristics
        if any(word in text_lower for word in ['advanced', 'complex', 'sophisticated', 'proof', 'theorem']):
            return "hard"
        elif any(word in text_lower for word in ['intermediate', 'method', 'technique', 'example']):
            return "medium"
        else:
            return "easy"
    
    async def process_educational_content(self, pdf_path: str) -> bool:
        """Process educational PDF and store in Qdrant"""
        try:
            text = self.extract_text_from_pdf(pdf_path)
            chunks = self.chunk_educational_content(text)
            
            # Store in Qdrant with educational metadata
            success = await qdrant_client.store_documents(chunks)
            logger.info(f"Processed {len(chunks)} educational chunks from {pdf_path}")
            return success
            
        except Exception as e:
            logger.error(f"Educational content processing failed: {e}")
            return False

# Global document processor instance
education_processor = EducationDocumentProcessor()