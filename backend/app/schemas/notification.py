from pydantic import BaseModel
from datetime import datetime


class NotificationRuleCreate(BaseModel):
    name: str
    scope: str  # "all" | "selected" | "single"
    device_uuids: str
    condition: str


class NotificationRuleRead(BaseModel):
    id: str
    user_id: str
    name: str
    scope: str
    device_uuids: str
    condition: str
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    rule_id: str
    device_uuid: str
    payload: dict


class NotificationRead(BaseModel):
    id: str
    user_id: str
    rule_id: str
    device_uuid: str
    payload: dict
    created_at: datetime

    class Config:
        from_attributes = True
