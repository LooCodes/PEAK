from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from db.database import get_db
from models.meal import Meal, MealItem
from models.user import User
from schemas.meal import MealWithItems, MealDaySubmit
from auth import get_current_user

router = APIRouter(prefix = "/meal-logger", tags = ["meal logger"])

def normalize_day(dt: datetime | None) -> datetime:
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo = timezone.utc)
    
    return dt

def day_bounds(dt: datetime) -> tuple[datetime, datetime]:
    start = dt.replace(hour = 0, minute = 0, second = 0, microsecond = 0);
    end = start + timedelta(days = 1)

    return start, end

def get_meal_for_day(db: Session, user_id: int, dt: datetime) -> Meal | None:
    """
    Find an existing meal for said date
    """
    start, end = day_bounds(dt)

    meal = db.query(Meal).options(joinedload(Meal.items).joinedload(MealItem.food)).filter(
        Meal.user_id == user_id,
        Meal.eaten_at >= start,
        Meal.eaten_at < end,
    ).order_by(Meal.eaten_at.desc()).first()

    return meal

@router.get("/today", response_model = Optional[MealWithItems])
def get_log(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Load the current user's meal for 'today'.
    If a meal exists for today, return said meal. Otherwise return None.
    """
    now = normalize_day(None)
    meal = get_meal_for_day(db = db, user_id = current_user.id, dt = now)

    if meal is None:
        return None

    return MealWithItems(
        meal = meal,
        items = meal.items,
    )

@router.post("/complete", response_model = MealWithItems)
def complete_log(payload: MealDaySubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Writes a new row for meal, or in other words, completes the meal logger for today.
    """
    eaten_at = normalize_day(dt = payload.eaten_at)
    start, end = day_bounds(dt = eaten_at)

    meal = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.eaten_at >= start,
        Meal.eaten_at < end,
    ).first()

    if meal is None:
        meal = Meal(
            user_id = current_user.id,
            eaten_at = eaten_at
        )
        db.add(meal)
        db.commit()
        db.refresh(meal)
    else:
        db.query(MealItem).filter(MealItem.meal_id == meal.id).delete()
        db.commit()

    for item in payload.items:
        meal_item = MealItem(
            meal_id = meal.id,
            food_id = item.food_id,
            qty = item.qty,
            meal_label = item.meal_label,
        )
        db.add(meal_item)

    db.commit()

    db.refresh(meal)
    meal = db.query(Meal).options(joinedload(Meal.items).joinedload(MealItem.food)).filter(
        Meal.id == meal.id
    ).first()

    return MealWithItems(
        meal = meal,
        items = meal.items,
    )