# app/api/v1/notifications.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.notification import NotificationRule, Notification


router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/rules")
def create_rule(user_id: str, name: str, scope: str, device_uuids: str, condition: str, db: Session = Depends(get_db)):
    rule = NotificationRule(user_id=user_id, name=name, scope=scope, device_uuids=device_uuids, condition=condition)
    db.add(rule); db.commit(); db.refresh(rule)
    return rule


@router.get("/rules")
def list_rules(user_id: str, db: Session = Depends(get_db)):
    return db.query(NotificationRule).filter_by(user_id=user_id).all()


@router.get("")
def list_notifications(user_id: str, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Notification).filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(limit).all()