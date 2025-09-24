from sqlalchemy.orm import Session
from app.models.heartbeat import Heartbeat
from app.schemas.heartbeat import HeartbeatCreate

def get_heartbeats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Heartbeat).offset(skip).limit(limit).all()

def create_heartbeat(db: Session, hb: HeartbeatCreate):
    db_hb = Heartbeat(**hb.dict())
    db.add(db_hb)
    db.commit()
    db.refresh(db_hb)
    return db_hb
