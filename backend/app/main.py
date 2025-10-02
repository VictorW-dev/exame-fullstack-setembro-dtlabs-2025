from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import asyncio

from app.api.v1 import api_router
from app.api.v1 import health
from app.db.session import engine
from app.db.base_class import Base
from app.ws.manager import manager
from app.services.notifier import notifier_worker

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Telemetry API",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    redirect_slashes=False
)

# Inicializar worker de notificações
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(notifier_worker())

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# usar o api_router centralizado
app.include_router(api_router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix="/health", tags=["health"])

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = Query(...)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # manter conexão viva
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

print("API_PREFIX:", settings.API_PREFIX)

