from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas, database
from .worker import celery
from celery.result import AsyncResult

router = APIRouter()

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, sku=product.sku)
    if db_product:
        raise HTTPException(status_code=400, detail="Product already registered")
    return crud.create_product(db=db, product=product)

@router.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@router.put("/products/{sku}", response_model=schemas.Product)
def update_product(sku: str, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud.update_product(db, sku=sku, product=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/products/{sku}", response_model=schemas.Product)
def delete_product(sku: str, db: Session = Depends(get_db)):
    db_product = crud.delete_product(db, sku=sku)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/products/")
def delete_all_products(db: Session = Depends(get_db)):
    crud.delete_all_products(db)
    return {"message": "All products deleted"}

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    # Pass content as bytes to celery task
    task = celery.send_task('app.tasks.process_csv_upload', args=[content])
    return {"task_id": task.id}

@router.get("/upload/{task_id}")
def get_upload_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result
    }

@router.post("/webhooks/", response_model=schemas.Webhook)
def create_webhook(webhook: schemas.WebhookCreate, db: Session = Depends(get_db)):
    return crud.create_webhook(db=db, webhook=webhook)

@router.get("/webhooks/", response_model=List[schemas.Webhook])
def read_webhooks(db: Session = Depends(get_db)):
    return crud.get_webhooks(db)

@router.delete("/webhooks/{webhook_id}", response_model=schemas.Webhook)
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    db_webhook = crud.delete_webhook(db, webhook_id=webhook_id)
    if db_webhook is None:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return db_webhook

@router.put("/webhooks/{webhook_id}", response_model=schemas.Webhook)
def update_webhook(webhook_id: int, webhook: schemas.WebhookCreate, db: Session = Depends(get_db)):
    db_webhook = crud.update_webhook(db, webhook_id=webhook_id, webhook=webhook)
    if db_webhook is None:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return db_webhook
