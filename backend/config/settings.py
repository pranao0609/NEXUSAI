# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # GROQ Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8000")
    # Qdrant Cloud Configuration
    QDRANT_URL = os.getenv("QDRANT_URL", "https://your-cluster-url.qdrant.io")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
    QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "health_documents")
    
    # Hugging Face Configuration
    HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    HF_TOKEN = os.getenv("HF_TOKEN", "")
    
    # Processing settings
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 200))
    TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", 5))

    MCQ_DIFFICULTY_LEVELS = ["easy", "medium", "hard"]
    DEFAULT_NUM_QUESTIONS = 5
    DEFAULT_DIFFICULTY = "medium"
    
    # Evaluation settings
    PASSING_SCORE = 70  # Percentage
    MAX_QUESTIONS_PER_QUIZ = 20

settings = Settings()