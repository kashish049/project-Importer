from sqlalchemy.orm import Session
from . import models, schemas

def get_product(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, sku: str, product: schemas.ProductUpdate):
    db_product = get_product(db, sku)
    if not db_product:
        return None
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, sku: str):
    db_product = get_product(db, sku)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def delete_all_products(db: Session):
    db.query(models.Product).delete()
    db.commit()

def create_webhook(db: Session, webhook: schemas.WebhookCreate):
    db_webhook = models.Webhook(**webhook.model_dump())
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook

def get_webhooks(db: Session):
    return db.query(models.Webhook).all()

def delete_webhook(db: Session, webhook_id: int):
    db_webhook = db.query(models.Webhook).filter(models.Webhook.id == webhook_id).first()
    if db_webhook:
        db.delete(db_webhook)
        db.commit()
    return db_webhook

def update_webhook(db: Session, webhook_id: int, webhook: schemas.WebhookCreate):
    db_webhook = db.query(models.Webhook).filter(models.Webhook.id == webhook_id).first()
    if not db_webhook:
        return None
    for key, value in webhook.model_dump().items():
        setattr(db_webhook, key, value)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook
