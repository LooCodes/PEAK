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
    return ChallengeStatus(
        user_challenge_id=user_challenge.id if user_challenge else None,
        challenge_id=challenge.id,
        type=challenge.type,
        title=challenge.title,
        description=challenge.description,
        points=challenge.points,
        completed=bool(user_challenge and user_challenge.completed_at),
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
    Raw user_challenges rows for this user.
    Mostly useful for debugging; dashboard should use /user/dashboard.
    """
    user_challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id
    ).all()
    return user_challenges


# ===================== DASHBOARD ENDPOINT (GLOBAL + PROGRESS) =====================

@router.get("/user/dashboard", response_model=DashboardChallengesResponse)
def get_user_dashboard_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dashboard view:

    - Start from ALL global challenges.
    - Look up corresponding UserChallenge for this user (if any).
    - Return ChallengeStatus objects, grouped into daily / weekly.
    """

    # 1) Global pool
    challenges = db.query(Challenge).all()

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

    # 4) If already completed, don't double-award XP
    if uc.completed_at:
        return {
            "completed": True,
            "weekly_xp": db_user.weekly_xp,
            "total_xp": db_user.total_xp,
        }

    # 5) Mark as completed
    uc.completed_at = datetime.now(timezone.utc)

    # 6) Award XP
    points = challenge.points or 0
    db_user.weekly_xp = (db_user.weekly_xp or 0) + points
    db_user.total_xp = (db_user.total_xp or 0) + points

    # 7) Save + refresh ONLY db_user and uc (NOT current_user)
    db.commit()
    db.refresh(uc)
    db.refresh(db_user)

    return {
        "completed": True,
        "weekly_xp": db_user.weekly_xp,
        "total_xp": db_user.total_xp,
    }
