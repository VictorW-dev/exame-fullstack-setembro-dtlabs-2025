from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.device import Device
from app.models.heartbeat import Heartbeat
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceRead

router = APIRouter(tags=["devices"])


# CREATE
@router.post("/", response_model=DeviceRead)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    db_device = db.query(Device).filter(Device.sn == device.sn).first()
    if db_device:
        raise HTTPException(status_code=400, detail="Device already exists")

    new_device = Device(**device.dict())
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device


# READ ALL
@router.get("/", response_model=list[DeviceRead])
def list_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    results = []
    for dev in devices:
        last = (
            db.query(Heartbeat)
            .filter(Heartbeat.device_sn == dev.sn)
            .order_by(Heartbeat.created_at.desc())
            .first()
        )
        results.append(
            DeviceRead(
                id=str(dev.id),
                sn=dev.sn,
                user_id=dev.user_id,
                name=dev.name,
                location=dev.location,
                description=dev.description,
                created_at=dev.created_at,
                last_heartbeat=last.created_at if last else None,
            )
        )
    return results


# READ ONE
@router.get("/{sn}", response_model=DeviceRead)
def get_device(sn: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.sn == sn).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    last = (
        db.query(Heartbeat)
        .filter(Heartbeat.device_sn == sn)
        .order_by(Heartbeat.created_at.desc())
        .first()
    )

    return DeviceRead(
        id=str(device.id),
        sn=device.sn,
        user_id=device.user_id,
        name=device.name,
        location=device.location,
        description=device.description,
        created_at=device.created_at,
        last_heartbeat=last.created_at if last else None,
    )


# UPDATE
@router.put("/{sn}", response_model=DeviceRead)
def update_device(sn: str, device_update: DeviceUpdate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.sn == sn).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    for key, value in device_update.dict(exclude_unset=True).items():
        setattr(device, key, value)

    db.commit()
    db.refresh(device)
    return device


# DELETE
@router.delete("/{sn}")
def delete_device(sn: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.sn == sn).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    db.delete(device)
    db.commit()
    return {"detail": "Device deleted"}
