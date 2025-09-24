from pydantic import BaseModel
from typing import Optional

class DeviceCreate(BaseModel):
    user_id: str
    name: str
    location: Optional[str] = None
    sn: str
    description: Optional[str] = None
