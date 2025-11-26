from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WebhookBase(BaseModel):
    url: str
    event_type: str
    is_active: bool = True

class WebhookCreate(WebhookBase):
    pass

class Webhook(WebhookBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskStatus(BaseModel):
    task_id: str
    status: str
    result: Optional[dict] = None
