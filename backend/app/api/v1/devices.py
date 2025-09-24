from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.device import Device
from app.schemas.device import DeviceCreate
import uuid

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("")
def create_device(payload: DeviceCreate, db: Session = Depends(get_db)):
    existing = db.query(Device).filter(Device.sn == payload.sn).first()
    if existing:
        return {"error": f"Device SN {payload.sn} já existe"}

    device = Device(
        uuid=str(uuid.uuid4()),
        name=payload.name,
        is_active=True,
    )
    # adiciona campos extras
    device.sn = payload.sn
    device.description = payload.description
    device.location = payload.location

    db.add(device)
    db.commit()
    db.refresh(device)
    return {"sn": device.sn, "uuid": device.uuid}
