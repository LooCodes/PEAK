from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChallengeResponse(BaseModel):
    id: int
    type: str
    title: Optional[str] = None
    description: Optional[str] = None
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserChallengeResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    streak_delta: int
    challenge: ChallengeResponse

    class Config:
        from_attributes = True
