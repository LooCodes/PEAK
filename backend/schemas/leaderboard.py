# backend/app/schemas/leaderboard.py
from datetime import date
from pydantic import BaseModel


class LeaderboardEntryBase(BaseModel):
    user_id: int
    period_start: date
    period_end: date
    points: int


class LeaderboardEntryRead(BaseModel):
    id: int
    username: str
    points: int
    rank: int

    class Config:
        orm_mode = True
