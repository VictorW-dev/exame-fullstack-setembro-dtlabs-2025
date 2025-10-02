import uuid
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.device import Device

def seed_devices():
    db: Session = SessionLocal()

    devices_data = [
        {"sn": "100000000000", "name": "Device-1"},
        {"sn": "100000000001", "name": "Device-2"},
        {"sn": "100000000002", "name": "Device-3"},
    ]

    for d in devices_data:
        existing = db.query(Device).filter(Device.sn == d["sn"]).first()
        if existing:
            print(f"⚠️ Device já existe: {existing.sn}")
            continue

        device = Device(
            uuid=str(uuid.uuid4()),
            sn=d["sn"],
            name=d["name"],
            is_active=True
        )
        db.add(device)
        print(f"✅ Device criado: {d['sn']} - {d['name']}")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_devices()
