from typing import Optional, List
from pydantic import BaseModel

class FoodSearchItem(BaseModel):
    """
    Lightweight item for search results.
    """
    id: int
    openfood_code: Optional[str] = None
    name: str
    calories_per_100g: Optional[float]


class FoodSearchResponse(BaseModel):
    results: List[FoodSearchItem]


class FoodItem(BaseModel):
    """
    Full food details (for overlay, logger, etc.).
    """
    id: int
    openfood_code: Optional[str] = None
    name: str
    calories_per_100g: Optional[float]
    protein_per_100g: Optional[float]
    carbs_per_100g: Optional[float]
    fats_per_100g: Optional[float]
    allergens: Optional[str] = ""


class FoodDBItem(FoodItem):
    """
    Same as FoodItem, but marked as loadable from ORM objects.
    """
    class Config:
        from_attributes = True