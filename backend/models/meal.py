from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base

class Food(Base):
    __tablename__ = "foods"
    __table_args__ = (UniqueConstraint("name", name="uq_foods_name"),)

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    calories_per_100g = Column(Numeric(8, 2), nullable=False)
    protein_per_100g  = Column(Numeric(8, 2), nullable=False)
    carbs_per_100g    = Column(Numeric(8, 2), nullable=False)
    fats_per_100g     = Column(Numeric(8, 2), nullable=False)
    allergens = Column(String)

class Meal(Base):
    __tablename__ = "meals"
    __table_args__ = (
        Index("ix_meals_user_eatenat_desc", "user_id", "eaten_at"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    eaten_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    user = relationship("User", back_populates="meals")
    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")

class MealItem(Base):
    __tablename__ = "meal_items"
    __table_args__ = (
        Index("ix_meal_items_meal_id", "meal_id"),
    )

    id = Column(Integer, primary_key=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    qty = Column(Numeric(8, 2), nullable=False)  # grams


    meal = relationship("Meal", back_populates="items")
    food = relationship("Food")
