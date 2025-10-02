from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json
import redis

from app.db.session import get_db
from app.models.heartbeat import Heartbeat
from app.models.device import Device
from app.models.notification import NotificationRule, Notification
from app.schemas.heartbeat import (
    HeartbeatCreate,
    HeartbeatRead,
    HeartbeatSummary,
    HeartbeatAlertsResponse,
    HeartbeatAlert,
)
from app.services.rules import match_rule
from app.core.config import settings

router = APIRouter(tags=["heartbeats"])


# Criar heartbeat (simulador envia aqui)
@router.post("/", response_model=HeartbeatRead, status_code=201)
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
    
    # Processar regras de notificação
    _process_notification_rules(device, record, db)
    
    return record


# Buscar todos os heartbeats (geral)
@router.get("/", response_model=List[HeartbeatRead])
def list_all_heartbeats(
    limit: int = Query(default=100, description="Número máximo de registros"),
    device_sn: str = Query(default=None, description="Filtrar por device específico"),
    db: Session = Depends(get_db),
):
    query = db.query(Heartbeat)
    
    if device_sn:
        query = query.filter(Heartbeat.device_sn == device_sn)
    
    records = (
        query.order_by(Heartbeat.created_at.desc())
        .limit(limit)
        .all()
    )
    return records


# Buscar histórico de heartbeats por device
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


# Resumo agregado de métricas
@router.get("/{device_sn}/summary", response_model=HeartbeatSummary)
def get_summary(
    device_sn: str,
    hours: int = Query(default=24, description="Período em horas"),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)

    summary = (
        db.query(
            func.avg(Heartbeat.cpu).label("cpu_avg"),
            func.max(Heartbeat.cpu).label("cpu_max"),
            func.min(Heartbeat.cpu).label("cpu_min"),
            func.avg(Heartbeat.ram).label("ram_avg"),
            func.max(Heartbeat.ram).label("ram_max"),
            func.min(Heartbeat.ram).label("ram_min"),
            func.avg(Heartbeat.temperature).label("temp_avg"),
            func.max(Heartbeat.temperature).label("temp_max"),
            func.min(Heartbeat.temperature).label("temp_min"),
        )
        .filter(Heartbeat.device_sn == device_sn, Heartbeat.created_at >= since)
        .first()
    )

    if not summary or summary.cpu_avg is None:
        raise HTTPException(status_code=404, detail="Sem dados no período solicitado")

    return summary._asdict()


# Detecção de alertas
@router.get("/{device_sn}/alerts", response_model=HeartbeatAlertsResponse)
def get_alerts(
    device_sn: str,
    hours: int = Query(default=1, description="Período em horas"),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)
    records = (
        db.query(Heartbeat)
        .filter(Heartbeat.device_sn == device_sn, Heartbeat.created_at >= since)
        .order_by(Heartbeat.created_at.desc())
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail="Sem dados no período solicitado")

    alerts: list[HeartbeatAlert] = []
    for hb in records:
        if hb.cpu > 90:
            alerts.append(HeartbeatAlert(type="CPU_HIGH", value=hb.cpu, at=hb.created_at))
        if hb.ram > 85:
            alerts.append(HeartbeatAlert(type="RAM_HIGH", value=hb.ram, at=hb.created_at))
        if hb.temperature > 80:
            alerts.append(HeartbeatAlert(type="TEMP_HIGH", value=hb.temperature, at=hb.created_at))
        if hb.dns_latency_ms > 150:
            alerts.append(HeartbeatAlert(type="LATENCY_HIGH", value=hb.dns_latency_ms, at=hb.created_at))
        if hb.connectivity == 0:
            alerts.append(HeartbeatAlert(type="OFFLINE", value=hb.connectivity, at=hb.created_at))

    return HeartbeatAlertsResponse(count=len(alerts), alerts=alerts)


def _process_notification_rules(device: Device, heartbeat: Heartbeat, db: Session):
    """Processa regras de notificação quando um heartbeat é recebido"""
    try:
        # Buscar regras do usuário
        rules = db.query(NotificationRule).filter(
            NotificationRule.user_id == device.user_id
        ).all()
        
        # Métricas do heartbeat atual
        metrics = {
            "cpu": heartbeat.cpu,
            "ram": heartbeat.ram,
            "disk_free": heartbeat.disk_free,
            "temperature": heartbeat.temperature,
            "dns_latency_ms": heartbeat.dns_latency_ms,
            "connectivity": heartbeat.connectivity
        }
        
        for rule in rules:
            # Verificar se a regra se aplica a este device
            if rule.scope == "single" and device.sn not in rule.device_sns:
                continue
            elif rule.scope == "selected" and device.sn not in rule.device_sns.split(","):
                continue
            # scope == "all" sempre se aplica
            
            # Avaliar condição
            if match_rule(rule.condition, metrics):
                # Criar notificação
                notification = Notification(
                    user_id=device.user_id,
                    rule_id=rule.id,
                    device_sn=device.sn,
                    payload={
                        "rule_name": rule.name,
                        "device_name": device.name,
                        "condition": rule.condition,
                        "metrics": metrics,
                        "timestamp": heartbeat.created_at.isoformat()
                    }
                )
                db.add(notification)
                db.commit()
                
                # Enviar via Redis para WebSocket
                try:
                    r = redis.from_url(settings.REDIS_URL)
                    message = {
                        "user_id": device.user_id,
                        "type": "notification",
                        "data": notification.payload
                    }
                    r.publish("notifications", json.dumps(message))
                except Exception as e:
                    print(f"❌ Erro ao enviar notificação via Redis: {e}")
                    
    except Exception as e:
        print(f"❌ Erro ao processar regras de notificação: {e}")
