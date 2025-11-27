# backend/app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db import get_db
from models import Meal, Workout, Challenge  # ⬅️ add Challenge here
from pydantic import BaseModel

router = APIRouter()


# ---------- Pydantic schemas for the frontend ----------

class ChallengeOut(BaseModel):
    id: int
    label: str       # what you display in the UI
    progress: int    # 0–100 for now (we'll keep 0 until we wire real progress)

    class Config:
        orm_mode = True


class ChallengesResponse(BaseModel):
    daily: List[ChallengeOut]
    weekly: List[ChallengeOut]


# ---------- Existing calendar endpoint ----------

@router.get("/calendar")
def get_calendar_data(db: Session = Depends(get_db)):
    meals = db.query(Meal).all()
    workouts = db.query(Workout).all()

    meal_dates = [m.eaten_at for m in meals]
    workout_dates = [w.performed_at for w in workouts]

    return {
        "meals": meal_dates,
        "workouts": workout_dates,
    }


# ---------- NEW challenges endpoint ----------

@router.get("/challenges", response_model=ChallengesResponse)
def get_challenges(db: Session = Depends(get_db)):
    # If main.py includes this router with prefix="/dashboard",
    # the full path will be: GET /dashboard/challenges
    daily_rows = db.query(Challenge).filter(Challenge.type == "daily").all()
    weekly_rows = db.query(Challenge).filter(Challenge.type == "weekly").all()

    def to_out(row: Challenge) -> ChallengeOut:
        # For now progress is 0; later we'll compute real progress per user.
        return ChallengeOut(id=row.id, label=row.title, progress=0)

    return ChallengesResponse(
        daily=[to_out(c) for c in daily_rows],
        weekly=[to_out(c) for c in weekly_rows],
    )
