from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Union



class ExerciseBase(BaseModel):
    name: str
    type: str
    muscle_group: str
    body_part: Optional[str] = None
    equipment_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    gif_url: Optional[str] = None
    instructions: Optional[List[str]] = None
    external_id: Optional[str] = None


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseResponse(ExerciseBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ExerciseListResponse(BaseModel):
    exercises: List[ExerciseResponse]


class UserWorkoutExerciseCreate(BaseModel):
    exercise_id: Union[str, int]


class UserWorkoutExerciseResponse(BaseModel):
    id: int
    user_id: int
    exercise_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AddExerciseResponse(BaseModel):
    status: str
    message: str
    workout_exercise: UserWorkoutExerciseResponse
