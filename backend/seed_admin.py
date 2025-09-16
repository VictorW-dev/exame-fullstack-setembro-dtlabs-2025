import uuid
from passlib.context import CryptContext
from app.db.session import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_admin():
    db = SessionLocal()

    existing = db.query(User).filter(User.email == "admin@demo.com").first()
    if existing:
        print("⚠️ Usuário admin já existe:", existing.email)
        db.close()
        return

    user = User(
        id=uuid.uuid4(),
        email="admin@demo.com",
        hashed_password=pwd_context.hash("admin"),
    )
    db.add(user)
    db.commit()
    db.close()
    print("✅ Usuário admin criado: admin@demo.com / admin")

if __name__ == "__main__":
    seed_admin()
