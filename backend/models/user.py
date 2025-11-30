from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    age = Column(Integer)
    weight = Column(Integer)  # store in kg
    height = Column(Integer)  # store in cm
    streak = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    weekly_xp = Column(Integer, default=0, nullable=False)
    total_xp = Column(Integer, default=0, nullable=False)

    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    user_challenges = relationship("UserChallenge", back_populates="user", cascade="all, delete-orphan")
    user_workout_exercises = relationship("UserWorkoutExercise", back_populates="user", cascade="all, delete-orphan")
    questionnaire_answers = relationship("UserQuestionnaireAnswer", back_populates="user", cascade="all, delete-orphan")
