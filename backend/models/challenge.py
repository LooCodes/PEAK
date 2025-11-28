from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class Challenge(Base):
    __tablename__ = "challenges"
    __table_args__ = (UniqueConstraint("type", name="uq_challenges_type"),)

    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    title = Column(String)                      
    description = Column(String)
    points = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    user_challenges = relationship("UserChallenge", back_populates="challenge", cascade="all, delete-orphan")

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    streak_delta = Column(Integer, default=0, nullable=False)


    user = relationship("User", back_populates="user_challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")