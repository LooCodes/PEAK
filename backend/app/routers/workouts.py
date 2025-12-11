from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.exercise import Exercise, Workout, WorkoutSet
from models.user import User
from schemas.workouts import WorkoutCreate, WorkoutCreateResponse
from auth import get_current_user

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=WorkoutCreateResponse)
def create_workout(
    payload: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a workout session with one or more exercises + sets.

    The payload looks like:
    {
      "performed_at": "...optional...",
      "notes": "...optional...",
      "exercises": [
        {
          "name": "Barbell Squat",
          "sets": [
            { "set_no": 1, "reps": 8, "weight": 40, "duration_seconds": 60 },
            ...
          ]
        },
        ...
      ]
    }

    For each exercise name, we either:
      - find an existing Exercise by name (case-insensitive), or
      - create a new Exercise row with minimal info.
    Then we create WorkoutSet rows linked to that Exercise.
    """
    if not payload.exercises:
        raise HTTPException(
            status_code=400,
            detail="Workout must contain at least one exercise",
        )

    # Filter out exercises with no name or no sets
    cleaned_exercises = []
    for ex in payload.exercises:
        name = ex.name.strip()
        cleaned_sets = [
            s
            for s in ex.sets
            if (s.reps is not None or s.weight is not None or s.duration_seconds is not None)
        ]
        if name and cleaned_sets:
            cleaned_exercises.append((name, cleaned_sets))

    if not cleaned_exercises:
        raise HTTPException(
            status_code=400,
            detail="Workout has no valid exercises or sets",
        )

    # Prepare / find Exercise rows
    exercise_ids: list[int] = []
    for name, _sets in cleaned_exercises:
        # Try to find an existing exercise by name (case-insensitive)
        existing = (
            db.query(Exercise)
            .filter(Exercise.name.ilike(name))
            .first()
        )

        if existing:
            ex_row = existing
        else:
            # Create a minimal custom exercise row
            ex_row = Exercise(
                name=name,
                type="strength",          # default
                muscle_group="Unknown",   # default
                body_part=None,
                equipment_type=None,
                thumbnail_url=None,
                gif_url=None,
                instructions=None,
                external_id=None,        # user-created, no external_id
            )
            db.add(ex_row)
            db.flush()  # assign ex_row.id

        exercise_ids.append(ex_row.id)

    # Now create the Workout row itself
    performed_at = payload.performed_at or datetime.now(timezone.utc)
    workout = Workout(
        user_id=current_user.id,
        performed_at=performed_at,
        notes=payload.notes,
    )
    db.add(workout)
    db.flush()  # get workout.id

    # Create WorkoutSet rows
    for (name, sets), exercise_id in zip(cleaned_exercises, exercise_ids):
        for s in sets:
            ws = WorkoutSet(
                workout_id=workout.id,
                exercise_id=exercise_id,
                set_no=s.set_no,
                reps=s.reps,
                weight=s.weight,
                duration_seconds=s.duration_seconds,
            )
            db.add(ws)

    db.commit()
    db.refresh(workout)

    return WorkoutCreateResponse(status="ok", workout_id=workout.id)
