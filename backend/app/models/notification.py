# app/models/notification.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, Float, Integer, JSON, TIMESTAMP
from app.db.base import Base
import uuid, datetime as dt


class NotificationRule(Base):
    __tablename__ = "notification_rules"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    # scope: "all" | "selected" | "single"
    scope: Mapped[str] = mapped_column(String)
    device_uuids: Mapped[str] = mapped_column(String) # CSV para simplicidade
    # condition expression (ex.: "cpu > 70" ou "temperature > 75")
    condition: Mapped[str] = mapped_column(String)
    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=False), default=lambda: dt.datetime.utcnow())


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    rule_id: Mapped[str] = mapped_column(String, ForeignKey("notification_rules.id"))
    device_uuid: Mapped[str] = mapped_column(String, ForeignKey("devices.uuid"))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=False), default=lambda: dt.datetime.utcnow())