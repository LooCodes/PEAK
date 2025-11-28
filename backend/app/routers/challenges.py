from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import SessionLocal
from models.challenge import Challenge, UserChallenge
from models.user import User
from schemas.challenges import ChallengeResponse, UserChallengeResponse
from auth import get_current_user


router = APIRouter(prefix="/api/challenges", tags=["challenges"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ChallengeResponse])
def get_all_challenges(db: Session = Depends(get_db)):
    """Get all available challenges."""
    challenges = db.query(Challenge).all()
    return challenges


@router.get("/user", response_model=list[UserChallengeResponse])
def get_user_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get challenges assigned to the current user."""
    user_challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id
    ).all()
    return user_challenges


@router.post("/{challenge_id}/join", status_code=status.HTTP_201_CREATED)
def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign a challenge to the current user."""
    # Check if challenge exists
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )

    # Check if user already has this challenge
    existing = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.challenge_id == challenge_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this challenge assigned"
        )

    # Create user challenge
    user_challenge = UserChallenge(
        user_id=current_user.id,
        challenge_id=challenge_id
    )
    db.add(user_challenge)
    db.commit()
    db.refresh(user_challenge)

    return {"message": "Challenge joined successfully", "user_challenge_id": user_challenge.id}
