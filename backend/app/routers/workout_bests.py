from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import SessionLocal
from models.exercise import Exercise, WorkoutSet, Workout
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
    # 1) find max weight per exercise for this user's workouts
    subq = (
        db.query(
            WorkoutSet.exercise_id.label("exercise_id"),
            func.max(WorkoutSet.weight).label("max_weight"),
        )
        .join(Workout, Workout.id == WorkoutSet.workout_id)
        .filter(Workout.user_id == current_user.id)
        .group_by(WorkoutSet.exercise_id)
        .subquery()
    )

    rows = (
        db.query(Exercise.id, Exercise.name, subq.c.max_weight)
        .join(subq, subq.c.exercise_id == Exercise.id)
        .order_by(Exercise.name.asc())
        .all()
    )

    bests = []
    for exercise_id, exercise_name, max_weight in rows:
        reps = 0
        if max_weight is not None:
            reps_row = (
                db.query(func.max(WorkoutSet.reps))
                .join(Workout, Workout.id == WorkoutSet.workout_id)
                .filter(
                    Workout.user_id == current_user.id,
                    WorkoutSet.exercise_id == exercise_id,
                    WorkoutSet.weight == max_weight,
                )
                .first()
            )
            if reps_row and reps_row[0] is not None:
                reps = int(reps_row[0])

        bests.append(
            WorkoutBest(
                exercise_id=exercise_id,
                exercise_name=exercise_name,
                max_weight=max_weight,
                reps_at_max=reps,
            )
        )

    return bests
