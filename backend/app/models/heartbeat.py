from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, Integer, TIMESTAMP, ForeignKey
from app.db.base_class import Base
import datetime as dt
import uuid

class Heartbeat(Base):
    __tablename__ = "heartbeats"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    device_sn: Mapped[str] = mapped_column(
        String, ForeignKey("devices.sn"), index=True
    )
    cpu: Mapped[float] = mapped_column(Float)
    ram: Mapped[float] = mapped_column(Float)
    disk_free: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    dns_latency_ms: Mapped[int] = mapped_column(Integer)
    connectivity: Mapped[int] = mapped_column(Integer)  # 0 ou 1
    boot_ts_utc: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=False))
    created_at: Mapped[dt.datetime] = mapped_column(
        TIMESTAMP(timezone=False), default=lambda: dt.datetime.utcnow()
    )
