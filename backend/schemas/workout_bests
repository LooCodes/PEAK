from pydantic import BaseModel
from typing import Optional


class WorkoutBestItem(BaseModel):
    exercise_id: int
    exercise_name: str
    max_weight: Optional[float] = None  # in kg
    reps_at_max: int
    
    class Config:
        from_attributes = True
