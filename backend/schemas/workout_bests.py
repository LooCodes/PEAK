from pydantic import BaseModel
from typing import Optional


class WorkoutBest(BaseModel):
    exercise_id: int
    exercise_name: str
    max_weight: Optional[float]
    reps_at_max: int

    class Config:
        from_attributes = True
