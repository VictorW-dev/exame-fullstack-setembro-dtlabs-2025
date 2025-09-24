from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1 import auth, devices, heartbeats, notifications, health
from app.db.session import engine
from app.db.base_class import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Telemetry API",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    redirect_slashes=False  # evita 307
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(devices.router, prefix=settings.API_PREFIX)
app.include_router(heartbeats.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix="/health", tags=["health"])
