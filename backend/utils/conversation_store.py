# utils/conversation_store.py

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from core.config import settings

MONGO_URI = settings.MONGO_URI
DB_NAME = settings.DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
conversations = db["conversations"]

async def save_message(session_id: str, role: str, content: str):
    print(f"[DEBUG] Skipping DB save: {session_id}, {role}, {content}")

async def get_conversation(session_id: str):
    print(f"[DEBUG] Skipping DB fetch for: {session_id}")
    return []