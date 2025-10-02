from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    id: str
    email: EmailStr

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    """Schema para retorno de dados do usuário (sem senha)."""
    pass
