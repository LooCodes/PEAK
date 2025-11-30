from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import traceback

from db import Base, engine
from models import *   # noqa: F401,F403 (loads User, Meal, Workout, etc.)
from .routers import dashboard, auth, nutrition, leaderboard, challenges, exercises, workouts, meal_logger, workout_bests, questionnaire

load_dotenv()

# Create tables on startup (safe to run repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PEAK Backend", version="0.1.0")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

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
app.include_router(nutrition.router, prefix = "/api")

# Leaderboard router
app.include_router(leaderboard.router)

# Challenges router
app.include_router(challenges.router)

# Exercises router
app.include_router(exercises.router)

# Workout router
app.include_router(workouts.router)

# Meal Logger router
app.include_router(meal_logger.router, prefix = "/api")
# Workout Bests router
app.include_router(workout_bests.router)

# Questionnaire router
app.include_router(questionnaire.router)
