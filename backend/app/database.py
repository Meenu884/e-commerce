import os
from functools import lru_cache
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    database_name: str = "foundry_goods"
    jwt_secret: str = "insecure-dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    admin_email: str = "admin@foundrygoods.test"
    admin_password: str = "AdminPass123!"
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


class Database:
    client: AsyncIOMotorClient = None
    db = None


database = Database()


async def connect_to_mongo():
    settings = get_settings()
    database.client = AsyncIOMotorClient(settings.mongo_uri)
    database.db = database.client[settings.database_name]
    # Helpful indexes
    await database.db.products.create_index("sku", unique=True)
    await database.db.products.create_index([("name", "text"), ("description", "text")])
    await database.db.users.create_index("email", unique=True)
    await database.db.orders.create_index("user_id")


async def close_mongo_connection():
    if database.client:
        database.client.close()


def get_db():
    return database.db
