from pydantic import BaseModel
from datetime import datetime
from typing import List


# Para criar heartbeat (POST)
class HeartbeatCreate(BaseModel):
    device_sn: str
    cpu: float
    ram: float
    disk_free: float
    temperature: float
    dns_latency_ms: int
    connectivity: int
    boot_ts_utc: datetime


# Para leitura/histórico
class HeartbeatRead(BaseModel):
    id: str
    device_sn: str
    cpu: float
    ram: float
    disk_free: float
    temperature: float
    dns_latency_ms: int
    connectivity: int
    boot_ts_utc: datetime
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2


# Resumo agregado
class HeartbeatSummary(BaseModel):
    cpu_avg: float
    cpu_max: float
    cpu_min: float
    ram_avg: float
    ram_max: float
    ram_min: float
    temp_avg: float
    temp_max: float
    temp_min: float


# Alerta individual
class HeartbeatAlert(BaseModel):
    type: str
    value: float | int
    at: datetime


# Lista de alertas
class HeartbeatAlertsResponse(BaseModel):
    count: int
    alerts: List[HeartbeatAlert]
