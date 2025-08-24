from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional
import uuid

class Role(str, Enum):
    user = "user"
    admin = "admin"
    superadmin = "superadmin"

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    role: Role = Role.user

    class Config:
        validate_by_name = True 
        from_attributes = True
        

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None