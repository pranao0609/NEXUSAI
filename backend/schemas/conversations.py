from pydantic import BaseModel
from typing import List
from datetime import datetime

class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str
    timestamp: datetime = datetime.utcnow()

class Conversation(BaseModel):
    session_id: str
    messages: List[Message]
    created_at: datetime = datetime.utcnow()
