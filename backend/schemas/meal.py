from datetime import datetime
from typing import Optional, List
from nutrition import FoodDBItem
from pydantic import BaseModel


class MealCreate(BaseModel):
    eaten_at: Optional[datetime] = None


class MealDB(BaseModel):
    id: int
    eaten_at: datetime

    class Config:
        from_attributes = True


class MealItemCreate(BaseModel):
    """
    Used when frontend sends items to be added to a meal.
    """
    meal_id: int
    food_id: int
    qty: float


class MealItemDB(BaseModel):
    """
    A meal item as returned from backend, including the food it refers to.
    """
    id: int
    meal_id: int
    food_id: int
    qty: float
    food: FoodDBItem

    class Config:
        from_attributes = True

class MealItemInput(BaseModel):
    """
    A single meal item in the logger being submitted from the frontend.
    """
    food_id: int
    qty: float

class MealDaySubmit(BaseModel):
    """
    Completion of the Nutrition logger.
    """
    eaten_at: Optional[datetime] = None
    items: List[MealItemInput]


class MealWithItems(BaseModel):
    """
    Convenience response type: a Meal plus all its items.
    """
    meal: MealDB
    meal_items: List[MealItemDB]
