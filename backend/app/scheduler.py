"""
Weekly scheduler to reset the leaderboard (users.weekly_xp = 0) every Monday at midnight UTC.
Also checks on startup if a reset is needed.
"""

from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import update, Column, Integer, DateTime
from sqlalchemy.sql import func
from db.session import SessionLocal
from models.user import User
from db.base import Base


# Track last reset time
class LeaderboardReset(Base):
    __tablename__ = "leaderboard_resets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    reset_at = Column(DateTime(timezone=True), server_default=func.now())


def get_last_reset_date():
    """Get the date of the last reset"""
    db = SessionLocal()
    try:
        last_reset = db.query(LeaderboardReset).order_by(LeaderboardReset.reset_at.desc()).first()
        return last_reset.reset_at if last_reset else None
    finally:
        db.close()


def should_reset():
    """
    Check if we need to reset based on the last reset date.
    Reset should happen once per week (every Monday).
    """
    last_reset = get_last_reset_date()
    now = datetime.now(timezone.utc)
    
    if not last_reset:
        # Never reset before
        return True
    
    # Get Monday of current week
    days_since_monday = now.weekday()  # 0 = Monday, 6 = Sunday
    current_week_monday = (now - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # If last reset was before this Monday, we need to reset
    return last_reset < current_week_monday


def reset_weekly_leaderboard():
    """
    Reset all users' weekly_xp to 0.
    This runs every Monday at 00:00 UTC and also on startup if needed.
    """
    if not should_reset():
        print(f"[{datetime.now(timezone.utc)}] Weekly leaderboard already reset for this week. Skipping.")
        return
    
    db = SessionLocal()
    try:
        # Reset weekly_xp for all users
        result = db.execute(
            update(User).values(weekly_xp=0)
        )
        
        # Record this reset
        reset_record = LeaderboardReset()
        db.add(reset_record)
        
        db.commit()
        print(f"[{datetime.now(timezone.utc)}] Weekly leaderboard reset completed. {result.rowcount} users reset.")
    except Exception as e:
        db.rollback()
        print(f"[{datetime.now(timezone.utc)}] ERROR resetting weekly leaderboard: {e}")
        raise
    finally:
        db.close()


def start_scheduler():
    """
    Start the background scheduler for weekly leaderboard resets.
    This should be called once at application startup.
    Also performs an immediate reset check on startup.
    """
    # First, check if we need to reset on startup
    print("[Scheduler] Checking if weekly reset is needed...")
    try:
        reset_weekly_leaderboard()
    except Exception as e:
        print(f"[Scheduler] Startup reset check failed: {e}")
    
    scheduler = BackgroundScheduler(timezone="UTC")
    
    # Schedule weekly reset every Monday at 00:00 UTC
    scheduler.add_job(
        reset_weekly_leaderboard,
        trigger=CronTrigger(day_of_week='mon', hour=0, minute=0),
        id='weekly_leaderboard_reset',
        name='Reset weekly leaderboard',
        replace_existing=True
    )
    
    scheduler.start()
    print("[Scheduler] Started. Weekly leaderboard will reset every Monday at 00:00 UTC.")
    print("[Scheduler] Also checks on startup if reset is needed.")
    
    return scheduler


def shutdown_scheduler(scheduler):
    """
    Gracefully shutdown the scheduler.
    """
    if scheduler:
        scheduler.shutdown()
        print("[Scheduler] Shutdown complete.")
