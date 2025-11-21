# backend/app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from models import Meal, Workout

router = APIRouter()


@router.get("/calendar")
def get_calendar_data(db: Session = Depends(get_db)):
    meals = db.query(Meal).all()
    workouts = db.query(Workout).all()

    # Use the EXACT SQLAlchemy fields from your models
    meal_dates = [m.eaten_at for m in meals]
    workout_dates = [w.performed_at for w in workouts]

    return {
        "meals": meal_dates,
        "workouts": workout_dates,
    }
