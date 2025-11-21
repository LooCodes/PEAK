# backend/app/main.py
from fastapi import FastAPI

from db import Base, engine
from models import *   # noqa: F401,F403 (loads User, Meal, Workout, etc.)
from .routers import dashboard

# Create tables on startup (safe to run repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PEAK Backend", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


# Dashboard router
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
