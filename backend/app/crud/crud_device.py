from sqlalchemy.orm import Session
from app.models.device import Device
from app.schemas.device import DeviceCreate

def get_device(db: Session, device_id: int):
    return db.query(Device).filter(Device.id == device_id).first()

def get_devices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Device).offset(skip).limit(limit).all()

def create_device(db: Session, device: DeviceCreate):
    db_device = Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device
