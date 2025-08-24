from motor import motor_asyncio
from core.config import settings

client = motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]
user_collection = db["users"]