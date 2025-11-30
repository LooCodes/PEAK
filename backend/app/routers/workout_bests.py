from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import SessionLocal
from models.exercise import Exercise, WorkoutSet
from models.user import User
from schemas.workout_bests import WorkoutBest
from auth import get_current_user


router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/bests", response_model=list[WorkoutBest])
def get_workout_bests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the user's personal bests (max weight) for each exercise they've done.
    """
    # Query workout sets for this user, grouped by exercise
    # For each exercise, find the max weight and the reps at that weight
    result = (
        db.query(
            Exercise.id,
            Exercise.name,
            func.max(WorkoutSet.weight).label("max_weight"),
            WorkoutSet.reps.label("reps_at_max"),
        )
        .join(WorkoutSet, WorkoutSet.exercise_id == Exercise.id)
        .filter(WorkoutSet.user_id == current_user.id)
        .group_by(Exercise.id, Exercise.name, WorkoutSet.reps)
        .order_by(Exercise.name.asc())
        .all()
    )

    bests = []
    for row in result:
        exercise_id, exercise_name, max_weight, reps = row
        bests.append(
            WorkoutBest(
                exercise_id=exercise_id,
                exercise_name=exercise_name,
                max_weight=max_weight,
                reps_at_max=reps or 0,
            )
        )

    return bests
