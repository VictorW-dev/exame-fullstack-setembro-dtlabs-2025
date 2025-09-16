# app/models/user.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from app.db.base import Base
import uuid


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)