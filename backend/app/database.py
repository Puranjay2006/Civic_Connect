from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class Database:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db = Database()


async def connect_to_database():
    """Initialize MongoDB connection"""
    logger.info(f"Connecting to MongoDB at {settings.mongodb_uri[:20]}...")
    try:
        db.client = AsyncIOMotorClient(
            settings.mongodb_uri,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,
        )
        db.db = db.client[settings.database_name]
        
        # Verify connection
        await db.client.admin.command("ping")
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_database_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")


async def create_indexes():
    """Create database indexes for optimal performance"""
    try:
        # Users collection indexes
        await db.db.users.create_index("email", unique=True)
        await db.db.users.create_index("createdAt")
        
        # Issues collection indexes
        await db.db.issues.create_index("userId")
        await db.db.issues.create_index("department")
        await db.db.issues.create_index("status")
        await db.db.issues.create_index([("department", 1), ("status", 1)])
        await db.db.issues.create_index("createdAt")
        await db.db.issues.create_index([("location.coordinates", "2dsphere")])
        
        # Departments collection indexes
        await db.db.departments.create_index("name", unique=True)
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db.db is None:
        raise RuntimeError("Database not initialized")
    return db.db


# Collection shortcuts
def get_users_collection():
    return get_database().users


def get_issues_collection():
    return get_database().issues


def get_departments_collection():
    return get_database().departments


def get_notifications_collection():
    return get_database().notifications
