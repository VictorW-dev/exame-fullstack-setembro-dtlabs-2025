# app/db/init_db.py
from app.db.session import engine
from app.db.base import Base
from app.models import user, device, heartbeat, notification


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)