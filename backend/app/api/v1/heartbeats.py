# app/api/v1/heartbeats.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.heartbeat import Heartbeat
from app.models.device import Device
import datetime as dt
import json
import redis
from app.core.config import settings
from app.models.notification import NotificationRule, Notification
from app.services.rules import match_rule


router = APIRouter(prefix="/heartbeats", tags=["heartbeats"])


r = redis.Redis.from_url(settings.REDIS_URL)




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def ingest(device_sn: str, cpu: float, ram: float, disk_free: float, temperature: float, 
           dns_latency_ms: int, connectivity: int, boot_ts_utc: dt.datetime, 
           db: Session = Depends(get_db)):
    dev = db.query(Device).filter_by(sn=device_sn).first()
    if not dev:
        raise HTTPException(404, "device not found")
    hb = Heartbeat(device_uuid=dev.uuid, cpu=cpu, ram=ram, disk_free=disk_free, 
                   temperature=temperature, dns_latency_ms=dns_latency_ms, 
                   connectivity=connectivity, boot_ts_utc=boot_ts_utc)
    db.add(hb); db.commit()


    metrics = {"cpu": cpu, "ram": ram, "disk_free": disk_free, "temperature": temperature, 
               "dns_latency_ms": dns_latency_ms, "connectivity": connectivity}


    rules = db.query(NotificationRule).filter_by(user_id=dev.user_id).all()
    for rule in rules:
        # escopo simplificado
        in_scope = ( 
            rule.scope == "all" or 
            (rule.scope == "single" and rule.device_uuids == dev.uuid) or
            (rule.scope == "selected" and dev.uuid in (rule.device_uuids or "").split(","))
        )
        if in_scope and match_rule(rule.condition, metrics):
            notif = Notification(user_id=dev.user_id, rule_id=rule.id, device_uuid=dev.uuid, payload=metrics)
            db.add(notif); db.commit()
            r.publish("notifications", json.dumps({
                "user_id": dev.user_id,
                "device_uuid": dev.uuid,
                "rule_id": rule.id,
                "metrics": metrics,
            }))
        return {"ok": True}


@router.get("")
def list(device_uuid: str, start: dt.datetime | None = None, end: dt.datetime | None = None, db: Session = Depends(get_db)):
    q = db.query(Heartbeat).filter_by(device_uuid=device_uuid)
    if start: q = q.filter(Heartbeat.created_at >= start)
    if end: q = q.filter(Heartbeat.created_at <= end)
    return q.order_by(Heartbeat.created_at.desc()).limit(2000).all()