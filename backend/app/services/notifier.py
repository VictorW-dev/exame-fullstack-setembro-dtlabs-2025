# app/services/notifier.py
import asyncio, json
import redis.asyncio as aioredis
from app.core.config import settings
from app.ws.manager import manager

CHANNEL = "notifications"

async def notifier_worker():
    # cria cliente Redis assíncrono
    r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe(CHANNEL)

    print(f"🔔 Notifier worker escutando canal '{CHANNEL}'")

    async for msg in pubsub.listen():
        if msg is None:
            await asyncio.sleep(0.1)
            continue

        if msg.get("type") == "message":
            try:
                payload = json.loads(msg["data"])
                await manager.send_user(payload["user_id"], payload)
            except Exception as e:
                print("❌ Erro ao processar notificação:", e)
