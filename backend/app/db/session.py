import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

# Pega a URL do banco do .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cria engine de conexão
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal é a sessão usada em cada request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependência que o FastAPI injeta em cada rota
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
