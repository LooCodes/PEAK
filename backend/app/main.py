from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from db import Base, engine
from models import *   # noqa: F401,F403 (loads User, Meal, Workout, etc.)
from .routers import dashboard, auth, nutrition, leaderboard, challenges

load_dotenv()

# Create tables on startup (safe to run repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PEAK Backend", version="0.1.0")

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Auth router
app.include_router(auth.router)

# Dashboard router
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Nutrition router
app.include_router(nutrition.router, prefix="/api")

# Leaderboard router
app.include_router(leaderboard.router)

# Challenges router
app.include_router(challenges.router)
