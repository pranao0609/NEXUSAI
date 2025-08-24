# utils/conversation_store.py

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "llm_chat"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
conversations = db["conversations"]

async def save_message(session_id: str, role: str, content: str):
    """
    Save a message into an existing conversation, or create one if not exists.
    Ensures only one conversation per session_id.
    """
    conversation = await conversations.find_one({"session_id": session_id})

    message = {"role": role, "content": content}

    if conversation:
        # push new message into existing conversation
        await conversations.update_one(
            {"_id": conversation["_id"]},
            {"$push": {"messages": message}}
        )
        return conversation["_id"]
    else:
        # create new conversation if not found
        new_conversation = {
            "session_id": session_id,
            "messages": [message]
        }
        result = await conversations.insert_one(new_conversation)
        return result.inserted_id
