# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(400, "Email already exists")
    u = User(email=email, hashed_password=hash_password(password))
    db.add(u); db.commit()
    return {"ok": True}


@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=email).first()
    if not u or not verify_password(password, u.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_access_token(u.id), "token_type": "bearer", "user_id": u.id}