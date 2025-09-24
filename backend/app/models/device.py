from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, TIMESTAMP, ForeignKey
from app.db.base_class import Base
import uuid, datetime as dt

class Device(Base):
    __tablename__ = "devices"

    uuid: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String, index=True)
    location: Mapped[str] = mapped_column(String, nullable=True)

    # novos campos
    sn: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(
        TIMESTAMP(timezone=False),
        default=lambda: dt.datetime.utcnow()
    )
