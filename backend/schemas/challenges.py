# backend/app/schemas/challenges.py
from datetime import datetime
from pydantic import BaseModel


class ChallengeResponse(BaseModel):
    id: int
    type: str
    title: str | None = None
    description: str | None = None
    points: int

    class Config:
        # pydantic v2 style (instead of orm_mode=True)
        from_attributes = True


class UserChallengeResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    assigned_at: datetime
    completed_at: datetime | None = None
    streak_delta: int

    class Config:
        from_attributes = True


class ChallengeStatus(BaseModel):
    """
    What the dashboard actually needs per challenge.
    Combines global Challenge and user-specific progress.
    """
    # user_challenge_id can be None if user has never interacted with this challenge
    user_challenge_id: int | None
    challenge_id: int
    type: str
    title: str | None = None
    description: str | None = None
    points: int

    completed: bool  # whether user has "done" it for this period
    streak_delta: int  # how many times they've completed it historically

    class Config:
        from_attributes = True


class DashboardChallengesResponse(BaseModel):
    daily: list[ChallengeStatus]
    weekly: list[ChallengeStatus]
