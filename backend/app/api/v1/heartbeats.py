from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.heartbeat import Heartbeat
from app.models.device import Device
from app.schemas.heartbeat import HeartbeatCreate, HeartbeatRead

router = APIRouter(prefix="/heartbeats", tags=["heartbeats"])

# Criar heartbeat (simulador envia aqui)
@router.post("", response_model=HeartbeatRead, status_code=201)
def create_heartbeat(hb: HeartbeatCreate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.sn == hb.device_sn).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device SN {hb.device_sn} não encontrado")

    record = Heartbeat(
        device_sn=hb.device_sn,
        cpu=hb.cpu,
        ram=hb.ram,
        disk_free=hb.disk_free,
        temperature=hb.temperature,
        dns_latency_ms=hb.dns_latency_ms,
        connectivity=hb.connectivity,
        boot_ts_utc=hb.boot_ts_utc,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

# Buscar histórico de heartbeats
@router.get("/{device_sn}", response_model=List[HeartbeatRead])
def list_heartbeats(
    device_sn: str,
    hours: int = Query(default=24, description="Período em horas"),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)
    records = (
        db.query(Heartbeat)
        .filter(Heartbeat.device_sn == device_sn, Heartbeat.created_at >= since)
        .order_by(Heartbeat.created_at.desc())
        .all()
    )
    return records
