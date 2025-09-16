import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, devices, heartbeats, notifications
from app.ws.manager import manager
from app.services.notifier import notifier_worker

def get_cors_origins():
    if settings.CORS_ORIGINS == "*":
        return ["*"]
    return [o.strip() for o in settings.CORS_ORIGINS.split(",")]

app = FastAPI(
    title="Telemetry API",
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(devices.router, prefix=settings.API_PREFIX)
app.include_router(heartbeats.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
async def startup():
    asyncio.create_task(notifier_worker())

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, user_id: str):
    await manager.connect(user_id, ws)
    try:
        while True:
            await ws.receive_text()  # keepalive / ignore client messages
    except WebSocketDisconnect:
        await manager.disconnect(user_id, ws)
