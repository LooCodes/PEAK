# backend/app/routers/leaderboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from models.user import User
from models.leaderboard import LeaderboardEntry
from auth import get_current_user
from schemas.leaderboard import LeaderboardItem


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




# ---------- Helper to build the weekly leaderboard ----------

def _build_weekly_leaderboard(db: Session) -> List[LeaderboardItem]:
    # Join users with leaderboard entries and sort by points desc
    rows = (
        db.query(User.username, LeaderboardEntry.weekly_points)
        .join(LeaderboardEntry, LeaderboardEntry.user_id == User.id)
        .order_by(LeaderboardEntry.weekly_points.desc(), User.id.asc())
        .all()
    )

    leaderboard: List[LeaderboardItem] = []
    for idx, row in enumerate(rows, start=1):
        leaderboard.append(
            LeaderboardItem(
                username=row.username,
                weekly_points=row.weekly_points,
                rank=idx,
            )
        )
    return leaderboard


# ---------- Endpoints ----------

@router.get("/weekly", response_model=List[LeaderboardItem])
def get_weekly_leaderboard(db: Session = Depends(get_db)):
    """
    Full weekly leaderboard (sorted by weekly_points desc).
    """
    return _build_weekly_leaderboard(db)


@router.get("/me", response_model=LeaderboardItem)
def get_my_weekly_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Current user's weekly points + rank.
    """
    leaderboard = _build_weekly_leaderboard(db)

    for item in leaderboard:
        if item.username == current_user.username:
            return item

    # Fallback: user has no leaderboard entry (shouldn't happen now)
    raise HTTPException(
        status_code=404,
        detail="Leaderboard entry not found for current user",
    )