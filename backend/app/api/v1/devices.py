# app/api/v1/devices.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.device import Device


router = APIRouter(prefix="/devices", tags=["devices"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_devices(user_id: str, db: Session = Depends(get_db)):
    return db.query(Device).filter_by(user_id=user_id).all()


@router.post("")
def create_device(user_id: str, name: str, location: str, sn: str, description: str, db: Session = Depends(get_db)):
    if len(sn) != 12:
        raise HTTPException(400, "sn must have 12 digits")
    d = Device(name=name, location=location, sn=sn, description=description, user_id=user_id)
    db.add(d); db.commit(); db.refresh(d)
    return d


@router.delete("/{uuid}")
def delete_device(uuid: str, user_id: str, db: Session = Depends(get_db)):
    d = db.query(Device).filter_by(uuid=uuid, user_id=user_id).first()
    if not d:
        raise HTTPException(404, "device not found")
    db.delete(d); db.commit()
    return {"ok": True}