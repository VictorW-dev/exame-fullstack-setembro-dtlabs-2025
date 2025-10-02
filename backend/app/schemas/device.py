from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# CREATE
class DeviceCreate(BaseModel):
    user_id: str
    name: str
    location: Optional[str] = None
    sn: str
    description: Optional[str] = None

# UPDATE
class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

# READ
class DeviceRead(BaseModel):
    id: str
    sn: str
    user_id: str
    name: str
    location: Optional[str]
    description: Optional[str]
    created_at: datetime
    last_heartbeat: Optional[datetime] = None  # campo extra para status

    class Config:
        from_attributes = True
