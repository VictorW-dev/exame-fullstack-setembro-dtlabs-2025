# app/models/device.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, Text
from app.db.base import Base
import uuid

class Device(Base):
    __tablename__ = "devices"
    uuid: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, index=True)
    location: Mapped[str] = mapped_column(String)
    sn: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)