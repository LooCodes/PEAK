from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
router = APIRouter()


# ---------- Pydantic schemas for the frontend ----------

class ChallengeOut(BaseModel):
    id: int
    label: str       # what you display in the UI
    progress: int    # 0–100 for now (we'll keep 0 until we wire real progress)

    class Config:
        orm_mode = True


class ChallengesResponse(BaseModel):
    daily: List[ChallengeOut]
    weekly: List[ChallengeOut]