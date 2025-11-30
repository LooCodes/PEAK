from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from db.session import SessionLocal
from models.exercise import Exercise, Workout, WorkoutSet
from models.user import User
from schemas.workouts import WorkoutBestItem
from auth import get_current_user


router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/bests", response_model=List[WorkoutBestItem])
def get_workout_bests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the user's personal best weight for each exercise.
    Returns exercises sorted by max weight descending.
    """
    # Subquery: find max weight per exercise for this user
    max_weight_per_exercise = (
        db.query(
            WorkoutSet.exercise_id,
            func.max(WorkoutSet.weight).label("max_weight")
        )
        .join(Workout)
        .filter(Workout.user_id == current_user.id)
        .group_by(WorkoutSet.exercise_id)
        .subquery()
    )

    # Main query: get exercise details and reps at max weight
    results = (
        db.query(
            Exercise.id.label("exercise_id"),
            Exercise.name.label("exercise_name"),
            max_weight_per_exercise.c.max_weight,
            WorkoutSet.reps.label("reps_at_max")
        )
        .join(max_weight_per_exercise, Exercise.id == max_weight_per_exercise.c.exercise_id)
        .outerjoin(
            WorkoutSet,
            (WorkoutSet.exercise_id == Exercise.id) & 
            (WorkoutSet.weight == max_weight_per_exercise.c.max_weight)
        )
        .join(Workout, WorkoutSet.workout_id == Workout.id)
        .filter(Workout.user_id == current_user.id)
        .order_by(max_weight_per_exercise.c.max_weight.desc())
        .all()
    )

    bests = []
    for exercise_id, exercise_name, max_weight, reps in results:
        bests.append(
            WorkoutBestItem(
                exercise_id=exercise_id,
                exercise_name=exercise_name,
                max_weight=float(max_weight) if max_weight else None,
                reps_at_max=reps or 0,
            )
        )

    return bests
