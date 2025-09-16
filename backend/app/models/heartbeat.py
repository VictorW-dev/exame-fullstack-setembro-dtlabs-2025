# app/models/heartbeat.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, Float, Integer, TIMESTAMP
from app.db.base import Base
import uuid, datetime as dt


class Heartbeat(Base):
    __tablename__ = "heartbeats"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_uuid: Mapped[str] = mapped_column(String, ForeignKey("devices.uuid"), index=True)
    cpu: Mapped[float] = mapped_column(Float)
    ram: Mapped[float] = mapped_column(Float)
    disk_free: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    dns_latency_ms: Mapped[int] = mapped_column(Integer)
    connectivity: Mapped[int] = mapped_column(Integer)
    boot_ts_utc: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=False))
    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=False), default=lambda: dt.datetime.utcnow())