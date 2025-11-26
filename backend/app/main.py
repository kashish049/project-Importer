from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Product Importer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Product Importer API"}

from .database import engine, Base
from . import models

# Create tables on startup
Base.metadata.create_all(bind=engine)

from .api import router
app.include_router(router, prefix="/api")

