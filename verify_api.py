import requests
import time
import json

BASE_URL = "http://localhost:8000/api"

def log(msg, success=True):
    icon = "✅" if success else "❌"
    print(f"{icon} {msg}")

def verify_backend():
    print("Starting Backend Verification...")
    
    # 1. Webhook Configuration (Story 4)
    print("\n--- Testing Webhooks ---")
    webhook_url = "https://webhook.site/test-uuid"
    try:
        res = requests.post(f"{BASE_URL}/webhooks/", json={"url": webhook_url, "event_type": "upload_completed", "is_active": True})
        if res.status_code == 200:
            log("Webhook created successfully")
        else:
            log(f"Failed to create webhook: {res.text}", False)
    except Exception as e:
        log(f"Webhook test failed: {e}", False)

    # 2. File Upload (Story 1 & 1A)
    print("\n--- Testing File Upload ---")
    csv_content = """sku,name,description,active
TEST001,Test Product 1,Description 1,true
TEST002,Test Product 2,Description 2,false
TEST003,Test Product 3,Description 3,true
"""
    files = {'file': ('test.csv', csv_content, 'text/csv')}
    task_id = None
    try:
        res = requests.post(f"{BASE_URL}/upload/", files=files)
        if res.status_code == 200:
            task_id = res.json()['task_id']
            log(f"Upload started. Task ID: {task_id}")
        else:
            log(f"Upload failed: {res.text}", False)
            return
    except Exception as e:
        log(f"Upload request failed: {e}", False)
        return

    # Poll progress
    if task_id:
        print("Polling for completion...")
        for _ in range(10):
            res = requests.get(f"{BASE_URL}/upload/{task_id}")
            data = res.json()
            status = data.get('status')
            print(f"Status: {status}")
            if status == 'SUCCESS':
                log("Upload processing completed")
                break
            if status == 'FAILURE':
                log(f"Upload processing failed: {data.get('result')}", False)
                break
            time.sleep(1)

    # 3. Product Management (Story 2)
    print("\n--- Testing Product CRUD ---")
    # List
    try:
        res = requests.get(f"{BASE_URL}/products/")
        products = res.json()
        if len(products) >= 3:
            log(f"Listed {len(products)} products (Expected >= 3)")
        else:
            log(f"Product count mismatch: {len(products)}", False)
    except Exception as e:
        log(f"List products failed: {e}", False)

    # Update
    try:
        res = requests.put(f"{BASE_URL}/products/TEST001", json={"name": "Updated Name", "is_active": False})
        if res.status_code == 200 and res.json()['name'] == "Updated Name":
            log("Product update successful")
        else:
            log(f"Product update failed: {res.text}", False)
    except Exception as e:
        log(f"Update product failed: {e}", False)

    # Delete
    try:
        res = requests.delete(f"{BASE_URL}/products/TEST002")
        if res.status_code == 200:
            log("Product delete successful")
        else:
            log(f"Product delete failed: {res.text}", False)
    except Exception as e:
        log(f"Delete product failed: {e}", False)

    # 4. Bulk Delete (Story 3)
    print("\n--- Testing Bulk Delete ---")
    try:
        res = requests.delete(f"{BASE_URL}/products/")
        if res.status_code == 200:
            log("Bulk delete successful")
            # Verify empty
            res = requests.get(f"{BASE_URL}/products/")
            if len(res.json()) == 0:
                log("Product list is empty after bulk delete")
            else:
                log("Products still exist after bulk delete", False)
        else:
            log(f"Bulk delete failed: {res.text}", False)
    except Exception as e:
        log(f"Bulk delete request failed: {e}", False)

if __name__ == "__main__":
    verify_backend()
