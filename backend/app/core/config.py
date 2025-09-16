# app/core/config.py
from pydantic import BaseModel
import os


class Settings(BaseModel):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")


settings = Settings()