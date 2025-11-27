from typing import Optional, List
from pydantic import BaseModel

class FoodSearchItem(BaseModel):
    code: Optional[str] 
    name: str
    calories_per_100g: Optional[float]

class FoodSearchResponse(BaseModel):
    results: List[FoodSearchItem]

class FoodItem(BaseModel):
    code: Optional[str] 
    name: str
    calories_per_100g: Optional[float]
    protein_per_100g: Optional[float]
    carbs_per_100g: Optional[float]
    fats_per_100g: Optional[float]
    allergens: Optional[str] = ""    

class FoodDBItem(BaseModel):
    id: int
    name: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fats_per_100g: float
    allergens: Optional[str]

    class Config:
        from_attributes = True