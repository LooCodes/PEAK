# backend/app/routers/admin.py
"""
Admin endpoints for manual operations like resetting the leaderboard.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import SessionLocal
from models.user import User
from auth import get_current_user
from app.scheduler import reset_weekly_leaderboard, get_last_reset_date

router = APIRouter(prefix="/api/admin", tags=["admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/reset-leaderboard")
def manual_reset_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually trigger a weekly leaderboard reset.
    This will reset all users' weekly_xp to 0 and record the reset.
    
    Note: This bypasses the weekly check and forces a reset.
    """
    try:
        # Force reset by temporarily modifying the function
        from app.scheduler import reset_weekly_leaderboard as original_reset
        from datetime import datetime, timezone
        from sqlalchemy import update
        from models.user import User
        from app.scheduler import LeaderboardReset
        
        # Perform the reset
        result = db.execute(update(User).values(weekly_xp=0))
        
        # Record this reset
        reset_record = LeaderboardReset()
        db.add(reset_record)
        db.commit()
        
        return {
            "message": "Leaderboard reset successfully",
            "users_reset": result.rowcount,
            "reset_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset leaderboard: {str(e)}"
        )


@router.get("/last-reset")
def get_last_reset(current_user: User = Depends(get_current_user)):
    """
    Get the timestamp of the last leaderboard reset.
    """
    last_reset = get_last_reset_date()
    
    return {
        "last_reset": last_reset.isoformat() if last_reset else None,
    }
