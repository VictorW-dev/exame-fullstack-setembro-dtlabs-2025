from pydantic import BaseModel
from datetime import datetime

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
        from_attributes = True  # substitui orm_mode no Pydantic v2
