from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional
import uuid
from datetime import datetime


class Role(str, Enum):
    user = "user"
    admin = "admin"
    superadmin = "superadmin"

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    name: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str | None = None
    role: Role = Role.user
    name: Optional[str] = None
    credits_used: int = 0
    credits_remaining: int = 1000
    subscription_plan: Optional[str] = None
    member_since: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True 
        from_attributes = True

class UserOut(BaseModel):
    id: str | None = None
    username: str
    email: str
    role: str
    name: Optional[str] = None
    credits_used: int
    credits_remaining: int
    subscription_plan: Optional[str] = None
    member_since: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(Token):
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None