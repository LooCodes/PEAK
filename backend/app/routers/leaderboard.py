# backend/app/routers/leaderboard.py
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from models.leaderboard import LeaderboardEntry      # ✅ correct
from models.user import User                         # ✅ correct
from schemas.leaderboard import LeaderboardEntryRead # ✅ correct
from db.database import get_db

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=List[LeaderboardEntryRead])
def get_leaderboard(
    period_start: Optional[date] = Query(None),
    period_end: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    # if dates not provided, you could compute current week here
    query = (
        db.query(LeaderboardEntry, User.username)
        .join(User, LeaderboardEntry.user_id == User.id)
    )

    if period_start is not None:
        query = query.filter(LeaderboardEntry.period_start == period_start)
    if period_end is not None:
        query = query.filter(LeaderboardEntry.period_end == period_end)

    entries = query.order_by(LeaderboardEntry.points.desc()).all()

    # Build ranking + shape into schema
    result: List[LeaderboardEntryRead] = []
    for idx, (entry, username) in enumerate(entries, start=1):
        result.append(
            LeaderboardEntryRead(
                id=entry.id,
                username=username,
                points=entry.points,
                rank=idx,
            )
        )
    return result
