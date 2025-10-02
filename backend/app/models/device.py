from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base_class import Base
import datetime as dt
import uuid

class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sn = Column(String(12), unique=True, index=True, nullable=False)  # serial number
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(
        TIMESTAMP(timezone=False), default=lambda: dt.datetime.utcnow()
    )

    # relacionamento
    heartbeats = relationship("Heartbeat", back_populates="device", cascade="all, delete-orphan")
