from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.session import SessionLocal
from models.user import User
from auth import get_current_user
from schemas.leaderboard import LeaderboardItem, LeaderboardSummary


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def _build_weekly_leaderboard(db: Session) -> List[LeaderboardItem]:
    """
    Build the weekly leaderboard from the users table:

    - Order users by users.weekly_xp DESC, then by users.id ASC for stability.
    - For API compatibility, we still expose the field as `weekly_points`,
      but its value is actually users.weekly_xp.
    """
    rows = (
        db.query(User)
        .order_by(User.weekly_xp.desc(), User.id.asc())
        .all()
    )

    leaderboard: List[LeaderboardItem] = []
    for idx, user in enumerate(rows, start=1):
        leaderboard.append(
            LeaderboardItem(
                username=user.username,
                weekly_points=user.weekly_xp or 0,
                rank=idx,
            )
        )
    return leaderboard


@router.get("/weekly", response_model=List[LeaderboardItem])
def get_weekly_leaderboard(db: Session = Depends(get_db)):
    """
    Full weekly leaderboard (sorted by users.weekly_xp desc).
    """
    return _build_weekly_leaderboard(db)


@router.get("/me", response_model=LeaderboardItem)
def get_my_weekly_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Current user's weekly points + rank.

    - Rank is computed from users.weekly_xp.
    - weekly_points in the response is actually users.weekly_xp.
    """
    leaderboard = _build_weekly_leaderboard(db)

    for item in leaderboard:
        if item.username == current_user.username:
            return item

    # Fallback: user not found in leaderboard (shouldn't happen if they exist in users)
    raise HTTPException(
        status_code=404,
        detail="Leaderboard entry not found for current user",
    )


@router.get("/me/summary", response_model=LeaderboardSummary)
def get_my_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compact summary for the dashboard card:

    - Rank in the weekly leaderboard, computed from users.weekly_xp.
    - weekly_xp from users.weekly_xp.
    - weekly_points mirrors weekly_xp for compatibility with existing types.
    """

    # 1) Compute rank based on users.weekly_xp
    rows = (
        db.query(User.id, User.weekly_xp)
        .order_by(User.weekly_xp.desc(), User.id.asc())
        .all()
    )

    rank: int | None = None
    weekly_points: int = 0

    for idx, row in enumerate(rows, start=1):
        if row.id == current_user.id:
            rank = idx
            weekly_points = row.weekly_xp or 0
            break

    # 2) weekly_xp from the users table for this logged-in user
    weekly_xp = current_user.weekly_xp or 0

    # If for some reason the user wasn't in the rows (shouldn't happen),
    # just default rank to None and weekly_points = weekly_xp.
    if rank is None:
        weekly_points = weekly_xp

    return LeaderboardSummary(
        rank=rank,
        weekly_xp=weekly_xp,
        weekly_points=weekly_points,
    )
