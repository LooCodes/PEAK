from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (UniqueConstraint("name", name="uq_exercises_name"),)

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    ## can enum later
    type = Column(String, nullable=False)
    muscle_group = Column(String, nullable=False)
    ##
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    sets = relationship("WorkoutSet", back_populates="exercise", cascade="all, delete-orphan")

class Workout(Base):
    __tablename__ = "workouts"
    __table_args__ = (
        Index("ix_workouts_user_performedat", "user_id", "performed_at"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    performed_at = Column(DateTime(timezone=True), nullable=False)
    notes = Column(String)

    user = relationship("User", back_populates="workouts")
    sets = relationship("WorkoutSet", back_populates="workout", cascade="all, delete-orphan")

class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    __table_args__ = (
        Index("ix_workout_sets_workout_id", "workout_id"),
    )

    id = Column(Integer, primary_key=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    set_no = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight = Column(Numeric(6, 2))           # kg
    duration_seconds = Column(Integer)       # optional
    calories = Column(Numeric(8, 2))         # optional

    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise", back_populates="sets")
