# backend/app/schemas/workouts.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

class WorkoutSetCreate(BaseModel):
    set_no: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration_seconds: Optional[int] = None


class WorkoutExerciseCreate(BaseModel):
    name: str
    sets: List[WorkoutSetCreate]


class WorkoutCreate(BaseModel):
    performed_at: Optional[datetime] = None
    notes: Optional[str] = None
    exercises: List[WorkoutExerciseCreate]


class WorkoutCreateResponse(BaseModel):
    status: str
    workout_id: int
