# app/ws/manager.py
from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: str, ws: WebSocket):
        self.connections.get(user_id, set()).discard(ws)

    async def send_user(self, user_id: str, data: dict):
        for ws in list(self.connections.get(user_id, set())):
            try:
                await ws.send_json(data)
            except Exception:
                # se falhar, desconecta para não manter conexão quebrada
                self.disconnect(user_id, ws)

manager = ConnectionManager()
