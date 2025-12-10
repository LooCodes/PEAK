# backend/app/routers/challenges.py
from datetime import datetime, timezone, date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, String   # ✅ this is the correct place

from db.session import SessionLocal
from models.challenge import Challenge, UserChallenge
from models.user import User
from schemas.challenges import (
    ChallengeResponse,
    UserChallengeResponse,
    ChallengeStatus,
    DashboardChallengesResponse,
)
from auth import get_current_user


router = APIRouter(prefix="/api/challenges", tags=["challenges"])


# ----- DB dependency -----

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----- Helper: global challenge + user progress -> ChallengeStatus -----

def _to_status(
    challenge: Challenge,
    user_challenge: UserChallenge | None,
) -> ChallengeStatus:
    """
    Convert a challenge and its user progress into a ChallengeStatus.
    Only consider the challenge completed if it was completed in the current rotation period:
    - Daily challenges: completed today
    - Weekly challenges: completed this week
    """
    completed = False
    if user_challenge and user_challenge.completed_at:
        today = date.today()
        completed_date = user_challenge.completed_at.date()
        
        if challenge.type.lower() == "daily":
            # Only completed if done today
            completed = (completed_date == today)
        elif challenge.type.lower() == "weekly":
            # Only completed if done this week
            week_start = today - timedelta(days=today.weekday())
            completed = (completed_date >= week_start)
    
    return ChallengeStatus(
        user_challenge_id=user_challenge.id if user_challenge else None,
        challenge_id=challenge.id,
        type=challenge.type,
        title=challenge.title,
        description=challenge.description,
        points=challenge.points,
        completed=completed,
        streak_delta=user_challenge.streak_delta if user_challenge else 0,
    )


# ===================== BASIC GLOBAL CHALLENGE ENDPOINTS =====================

@router.get("/", response_model=list[ChallengeResponse])
def get_all_challenges(db: Session = Depends(get_db)):
    """
    Return a rotating subset of challenges for the dashboard:
    - 2 daily challenges (change every day)
    - 2 weekly challenges (change every week)
    """

    today = date.today()
    # Monday of the current week; used as "seed" so weekly selection is stable for that week
    week_start = today - timedelta(days=today.weekday())

    # 2 DAILY challenges, randomized but stable for a given date
    daily_challenges = (
        db.query(Challenge)
        .filter(Challenge.type.ilike("daily"))
        .order_by(
            func.md5(
                func.concat(
                    cast(Challenge.id, String),
                    cast(today, String),       # changes every day
                )
            )
        )
        .limit(2)
        .all()
    )

    # 2 WEEKLY challenges, randomized but stable for a given week
    weekly_challenges = (
        db.query(Challenge)
        .filter(Challenge.type.ilike("weekly"))
        .order_by(
            func.md5(
                func.concat(
                    cast(Challenge.id, String),
                    cast(week_start, String),   # changes once per week
                )
            )
        )
        .limit(2)
        .all()
    )

    # Return 4 total (2 daily + 2 weekly)
    return daily_challenges + weekly_challenges


@router.get("/user", response_model=list[UserChallengeResponse])
def get_user_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return user_challenges that are relevant for the current rotation period:
    - Daily challenges: only show as completed if completed today
    - Weekly challenges: only show as completed if completed this week
    """
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_start_datetime = datetime.combine(week_start, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_start_datetime = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    
    user_challenges = db.query(UserChallenge).join(Challenge).filter(
        UserChallenge.user_id == current_user.id
    ).all()
    
    # Filter completions based on rotation period
    filtered_challenges = []
    for uc in user_challenges:
        if uc.completed_at:
            # Check if this completion is still valid for current rotation
            if uc.challenge.type.lower() == "daily":
                # Only show as completed if completed today
                if uc.completed_at >= today_start_datetime:
                    filtered_challenges.append(uc)
            elif uc.challenge.type.lower() == "weekly":
                # Only show as completed if completed this week
                if uc.completed_at >= week_start_datetime:
                    filtered_challenges.append(uc)
        else:
            # Include uncompleted challenges
            filtered_challenges.append(uc)
    
    return filtered_challenges


# ===================== DASHBOARD ENDPOINT (GLOBAL + PROGRESS) =====================

@router.get("/user/dashboard", response_model=DashboardChallengesResponse)
def get_user_dashboard_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dashboard view with rotating challenges:

    - Return 2 daily challenges (rotating daily)
    - Return 2 weekly challenges (rotating weekly)
    - Look up corresponding UserChallenge for this user (if any).
    - Return ChallengeStatus objects, grouped into daily / weekly.
    """

    today = date.today()
    # Monday of the current week; used as "seed" so weekly selection is stable for that week
    week_start = today - timedelta(days=today.weekday())

    # 1) Get rotating challenges (2 daily + 2 weekly)
    daily_challenges = (
        db.query(Challenge)
        .filter(Challenge.type.ilike("daily"))
        .order_by(
            func.md5(
                func.concat(
                    cast(Challenge.id, String),
                    cast(today, String),       # changes every day
                )
            )
        )
        .limit(2)
        .all()
    )

    weekly_challenges = (
        db.query(Challenge)
        .filter(Challenge.type.ilike("weekly"))
        .order_by(
            func.md5(
                func.concat(
                    cast(Challenge.id, String),
                    cast(week_start, String),   # changes once per week
                )
            )
        )
        .limit(2)
        .all()
    )

    challenges = daily_challenges + weekly_challenges

    # 2) User-specific progress for this user
    user_challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id
    ).all()
    uc_by_challenge_id = {uc.challenge_id: uc for uc in user_challenges}

    # 3) Build status list
    daily: list[ChallengeStatus] = []
    weekly: list[ChallengeStatus] = []

    for ch in challenges:
        uc = uc_by_challenge_id.get(ch.id)
        status = _to_status(ch, uc)

        if ch.type.lower() == "daily":
            daily.append(status)
        elif ch.type.lower() == "weekly":
            weekly.append(status)
        else:
            weekly.append(status)

    return DashboardChallengesResponse(daily=daily, weekly=weekly)


# ===================== JOIN (optional explicit assignment) =====================

@router.post("/{challenge_id}/join", status_code=status.HTTP_201_CREATED)
def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Explicitly assign a challenge to the current user (optional).
    """
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    existing = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.challenge_id == challenge_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this challenge assigned",
        )

    user_challenge = UserChallenge(
        user_id=current_user.id,
        challenge_id=challenge_id,
    )
    db.add(user_challenge)
    db.commit()
    db.refresh(user_challenge)

    return {
        "message": "Challenge joined successfully",
        "user_challenge_id": user_challenge.id,
    }


# ===================== INCREMENT PROGRESS (unused for checkbox) =====================

@router.post("/user/{challenge_id}/increment", response_model=ChallengeStatus)
def increment_challenge_progress(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Increment the user's progress on a given challenge.
    """

    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    uc = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.challenge_id == challenge_id,
    ).first()

    if not uc:
        uc = UserChallenge(
            user_id=current_user.id,
            challenge_id=challenge_id,
            streak_delta=0,
        )
        db.add(uc)

    uc.streak_delta += 1

    if uc.completed_at is None:
        uc.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(uc)

    return _to_status(challenge, uc)


# ===================== COMPLETE ENDPOINT (FOR CHECKBOX) =====================

@router.post("/user/{challenge_id}/complete")
def complete_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a challenge as completed for this user and award XP.

    - Ensures the challenge exists.
    - Creates a UserChallenge row if it doesn't exist yet.
    - Sets completed_at (if not already set).
    - Adds challenge.points to user's weekly_xp and total_xp.
    """
    # 1) Ensure the global challenge exists
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    # 2) Load a FRESH User object bound to THIS session
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # 3) Get or create UserChallenge row
    uc = db.query(UserChallenge).filter(
        UserChallenge.user_id == db_user.id,
        UserChallenge.challenge_id == challenge_id,
    ).first()

    if not uc:
        uc = UserChallenge(
            user_id=db_user.id,
            challenge_id=challenge_id,
        )
        db.add(uc)
        db.flush()  # get uc.id without a full commit yet

    # 4) Check if already completed IN THE CURRENT ROTATION PERIOD
    today = date.today()
    now = datetime.now(timezone.utc)
    already_completed_in_period = False
    
    if uc.completed_at:
        completed_date = uc.completed_at.date()
        
        if challenge.type.lower() == "daily":
            # Check if completed today
            already_completed_in_period = (completed_date == today)
        elif challenge.type.lower() == "weekly":
            # Check if completed this week
            week_start = today - timedelta(days=today.weekday())
            already_completed_in_period = (completed_date >= week_start)
    
    if already_completed_in_period:
        return {
            "completed": True,
            "weekly_xp": db_user.weekly_xp,
            "total_xp": db_user.total_xp,
            "streak": db_user.streak,
        }

    # 5) Check if streak should reset or increment (based on EST timezone days)
    # Use EST timezone for day boundaries
    from zoneinfo import ZoneInfo
    est = ZoneInfo("America/New_York")
    
    now_est = now.astimezone(est)
    today_est = now_est.date()
    
    should_increment_streak = False
    
    if db_user.last_challenge_completed_at:
        last_completed_est = db_user.last_challenge_completed_at.astimezone(est)
        last_completed_date_est = last_completed_est.date()
        
        # Calculate the difference in days
        days_diff = (today_est - last_completed_date_est).days
        
        if days_diff > 1:
            # More than 1 day gap - streak broken, reset to 0
            db_user.streak = 0
            should_increment_streak = True  # Start new streak
        elif days_diff == 1:
            # Exactly 1 day later - continue streak
            should_increment_streak = True
        # elif days_diff == 0: Same day - don't increment
    else:
        # First challenge ever - start streak at 1
        should_increment_streak = True
    
    # 6) Mark as completed
    uc.completed_at = now

    # 7) Award XP
    points = challenge.points or 0
    db_user.weekly_xp = (db_user.weekly_xp or 0) + points
    db_user.total_xp = (db_user.total_xp or 0) + points
    
    # 8) Increment streak only once per day and update last completion time
    if should_increment_streak:
        db_user.streak = (db_user.streak or 0) + 1
    db_user.last_challenge_completed_at = now

    # 9) Save + refresh ONLY db_user and uc (NOT current_user)
    db.commit()
    db.refresh(uc)
    db.refresh(db_user)

    return {
        "completed": True,
        "weekly_xp": db_user.weekly_xp,
        "total_xp": db_user.total_xp,
        "streak": db_user.streak,
    }
