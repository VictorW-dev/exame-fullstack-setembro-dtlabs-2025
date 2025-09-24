from fastapi import APIRouter
from app.api.v1 import auth, devices, heartbeats, notifications, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(heartbeats.router, prefix="/heartbeats", tags=["heartbeats"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
