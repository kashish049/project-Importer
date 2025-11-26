from .worker import celery
from datetime import datetime
import time

from .worker import celery
from .database import SessionLocal
from .models import Product, Webhook
from sqlalchemy.dialects.postgresql import insert
import csv
import io
import requests

@celery.task(bind=True)
def process_csv_upload(self, file_content: bytes):
    db = SessionLocal()
    try:
        decoded_content = file_content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        # Count total lines for progress
        rows = list(csv_reader)
        total_records = len(rows)
        
        processed_count = 0
        batch_size = 1000
        batch = []

        for row in rows:
            # Normalize keys to match model (case insensitive SKU handled by DB constraint usually, but we can lower it here if needed)
            # Requirement: SKU case-insensitive. We will store as provided but ensure uniqueness.
            # Actually, "treating the SKU as case-insensitive" implies we should probably normalize to lowercase or uppercase for storage/comparison?
            # Or just rely on the DB unique constraint? "The system should automatically overwrite based on SKU".
            # Let's assume input SKU is the key.
            
            product_data = {
                "sku": row.get("sku"),
                "name": row.get("name"),
                "description": row.get("description"),
                "is_active": str(row.get("active", "true")).lower() == "true" # Handle active flag
            }
            
            if not product_data["sku"]:
                continue

            batch.append(product_data)
            
            if len(batch) >= batch_size:
                upsert_batch(db, batch)
                processed_count += len(batch)
                batch = []
                self.update_state(state='PROGRESS',
                                  meta={'current': processed_count, 'total': total_records,
                                        'status': 'Processing...'})

        if batch:
            upsert_batch(db, batch)
            processed_count += len(batch)
            self.update_state(state='PROGRESS',
                              meta={'current': processed_count, 'total': total_records,
                                    'status': 'Processing...'})

        # Trigger Webhooks
        trigger_webhooks(db, "upload_completed")

        return {'current': total_records, 'total': total_records, 'status': 'Import Completed', 'result': f'Processed {total_records} records'}
    
    except Exception as e:
        return {'current': 0, 'total': 0, 'status': 'Failed', 'result': str(e)}
    finally:
        db.close()

def upsert_batch(db, batch):
    # Deduplicate by SKU - keep last occurrence (case-insensitive)
    seen_skus = {}
    for item in batch:
        sku_lower = item['sku'].lower() if item['sku'] else None
        if sku_lower:
            seen_skus[sku_lower] = item
    
    # Use deduplicated batch
    unique_batch = list(seen_skus.values())
    
    if not unique_batch:
        return
    
    stmt = insert(Product).values(unique_batch)
    stmt = stmt.on_conflict_do_update(
        index_elements=['sku'],
        set_={
            'name': stmt.excluded.name,
            'description': stmt.excluded.description,
            'is_active': stmt.excluded.is_active,
            'updated_at': stmt.excluded.updated_at
        }
    )
    db.execute(stmt)
    db.commit()

def trigger_webhooks(db, event_type):
    webhooks = db.query(Webhook).filter(Webhook.event_type == event_type, Webhook.is_active == True).all()
    for webhook in webhooks:
        try:
            requests.post(webhook.url, json={"event": event_type, "timestamp": str(datetime.now())}, timeout=5)
        except:
            pass # Fail silently for now

