"""Database connection manager with in-memory fallback."""

import os
import uuid
from typing import Optional

# In-memory storage fallback
_memory_store: dict = {}

# MongoDB connection (lazy)
_db = None


async def get_db():
    """Get MongoDB database or None if unavailable."""
    global _db
    if _db is not None:
        return _db

    mongo_uri = os.getenv("MONGODB_URI", "mongodb+srv://santhoshdinakaran3:santhosh163@cluster0.9zsb2ug.mongodb.net/?appName=Cluster0")
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        _db = client["ats_analyzer"]
        print("✅ Connected to MongoDB")
        return _db
    except Exception as e:
        print(f"⚠️  MongoDB unavailable ({e}). Using in-memory storage.")
        return None


def generate_id() -> str:
    return uuid.uuid4().hex[:12]


async def store_resume(resume_id: str, data: dict):
    """Store resume data."""
    db = await get_db()
    if db is not None:
        data["_id"] = resume_id
        await db.resumes.replace_one({"_id": resume_id}, data, upsert=True)
    else:
        _memory_store[resume_id] = data


async def get_resume(resume_id: str) -> Optional[dict]:
    """Retrieve resume data."""
    db = await get_db()
    if db is not None:
        doc = await db.resumes.find_one({"_id": resume_id})
        return doc
    else:
        return _memory_store.get(resume_id)


async def store_analysis(resume_id: str, data: dict):
    """Store analysis results."""
    db = await get_db()
    if db is not None:
        data["_id"] = resume_id
        await db.analyses.replace_one({"_id": resume_id}, data, upsert=True)
    else:
        _memory_store[f"analysis_{resume_id}"] = data


async def get_analysis(resume_id: str) -> Optional[dict]:
    """Retrieve analysis results."""
    db = await get_db()
    if db is not None:
        return await db.analyses.find_one({"_id": resume_id})
    else:
        return _memory_store.get(f"analysis_{resume_id}")
