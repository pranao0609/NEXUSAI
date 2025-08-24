from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ChatRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"
    tool = "tool"

class Message(BaseModel):
    msg_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: ChatRole
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class ConversationBase(BaseModel):
    title: str = "Untitled chat"

class ConversationCreate(ConversationBase):
    pass

class ConversationInDB(ConversationBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    messages: List[Message] = Field(default_factory=list)
    is_archived: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        from_attributes = True

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None

class MessageCreate(BaseModel):
    role: ChatRole
    content: str
    metadata: Optional[Dict[str, Any]] = None
