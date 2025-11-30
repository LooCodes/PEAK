# backend/app/schemas/workouts.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# ---------- INPUT SCHEMAS (from frontend) ----------

class WorkoutSetCreate(BaseModel):
    set_no: int
    reps: Optional[int] = None        # ✅ can be null
    weight: Optional[float] = None    # ✅ can be null
    duration_seconds: Optional[int] = None  # ✅ can be null


class WorkoutExerciseCreate(BaseModel):
    # We now create/find exercises by NAME, not exercise_id
    name: str
    sets: List[WorkoutSetCreate]


class WorkoutCreate(BaseModel):
    performed_at: Optional[datetime] = None
    notes: Optional[str] = None
    exercises: List[WorkoutExerciseCreate]


# ---------- OUTPUT / RESPONSE SCHEMAS ----------

class WorkoutCreateResponse(BaseModel):
    status: str
    workout_id: int
