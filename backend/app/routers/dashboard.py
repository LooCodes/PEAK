from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from models import (
    Meal,
    MealItem,
    Food,
    Workout,
    WorkoutSet,
    Exercise,
    User,
)
from auth import get_current_user 

router = APIRouter()


@router.get("/")
def get_calendar_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  
):
    """
    Calendar + dashboard data for the *logged-in* user.

    Uses current_user.id from auth instead of a hardcoded user_id.
    """

    user_id = current_user.id

    meals = (
        db.query(Meal)
        .filter(Meal.user_id == user_id)
        .order_by(Meal.eaten_at.desc())
        .all()
    )

    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == user_id)
        .order_by(Workout.performed_at.desc())
        .all()
    )

    # We send date-only strings ("YYYY-MM-DD") so the frontend doesn't have to parse
    meal_dates_set = {m.eaten_at.date().isoformat() for m in meals if m.eaten_at}
    workout_dates_set = {w.performed_at.date().isoformat() for w in workouts if w.performed_at}

    meal_dates = sorted(meal_dates_set)
    workout_dates = sorted(workout_dates_set)

    meals_payload = []
    for m in meals:
        items_payload = []
        for item in m.items:
            food = item.food
            items_payload.append(
                {
                    "foodId": food.id,
                    "foodName": food.name,
                    "qtyGrams": float(item.qty) if item.qty is not None else None,
                    "caloriesPer100g": float(food.calories_per_100g),
                    "proteinPer100g": float(food.protein_per_100g),
                    "carbsPer100g": float(food.carbs_per_100g),
                    "fatsPer100g": float(food.fats_per_100g),
                    "allergens": food.allergens,
                }
            )

        meals_payload.append(
            {
                "id": m.id,
                "eatenAt": m.eaten_at.isoformat() if m.eaten_at else None,
                "createdAt": m.created_at.isoformat() if m.created_at else None,
                "items": items_payload,
            }
        )

    workouts_payload = []
    for w in workouts:
        sets_payload = []
        for s in w.sets:
            exercise = s.exercise
            sets_payload.append(
                {
                    "id": s.id,
                    "setNo": s.set_no,
                    "reps": s.reps,
                    "weight": float(s.weight) if s.weight is not None else None,
                    "durationSeconds": s.duration_seconds,
                    "calories": float(s.calories) if s.calories is not None else None,
                    "exercise": {
                        "id": exercise.id,
                        "name": exercise.name,
                        "type": exercise.type,
                        "muscleGroup": exercise.muscle_group,
                    },
                }
            )

        workouts_payload.append(
            {
                "id": w.id,
                "performedAt": w.performed_at.isoformat() if w.performed_at else None,
                "notes": w.notes,
                "sets": sets_payload,
            }
        )

    return {
        "mealDates": meal_dates,
        "workoutDates": workout_dates,
        "meals": meals_payload,
        "workouts": workouts_payload,
    }
