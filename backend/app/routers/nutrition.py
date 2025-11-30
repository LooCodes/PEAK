from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from openfoodfacts import API, Country, Flavor, APIVersion, Environment
from requests.exceptions import ReadTimeout, RequestException
from schemas.nutrition import FoodSearchItem, FoodSearchResponse, FoodItem
from db.database import get_db
from models.meal import Food

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

nutrition_api = API(
    user_agent="PEAK/1.0",
    username=None,
    password=None,
    country=Country.us,
    flavor=Flavor.off,
    version=APIVersion.v2,
    environment=Environment.org,
    timeout=30,
)

def search_openfoodfacts(query: str, limit: int = 20) -> list:
    """
    Helper function to use OpenFoodFacts API.
    """
    try:
        products = nutrition_api.product.text_search(query)
    except ReadTimeout:
        raise HTTPException(
            status_code=504,
            detail="OpenFoodFacts request timed out. Please try again."
        )
    except RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"OpenFoodFacts request failed: {e}"
        )

    if isinstance(products, dict):
        products = products.get("products", [])

    return products[:limit]

def upsert_food(product: dict, db: Session) -> Food:
    """
    Given a raw OpenFoodFacts product, it'll ensure that there is a food row for it in Foods.
    If a Food with the same openfoodfacts code already exists, possibly update food with new values. 
    Otherwise, create a new Food.
    """
    code = product.get("code")
    name = product.get("product_name") or "Unknown"
    nutrients = product.get("nutriments", {}) or {}

    food = None
    if code:
        food = db.query(Food).filter(Food.openfood_code == code).first()
    
    if food is None:
        food = Food(openfood_code = code)
    
    food.name = name
    food.calories_per_100g = nutrients.get("energy-kcal_100g") or 0.0
    food.protein_per_100g = nutrients.get("proteins_100g") or 0.0
    food.carbs_per_100g = nutrients.get("carbohydrates_100g") or 0.0
    food.fats_per_100g = nutrients.get("fat_100g") or 0.0
    food.allergens = product.get("allergens", "") or ""

    if food.id is None:
        db.add(food)
    
    return food

@router.get("/search", response_model = FoodSearchResponse)
def search_foods(query: str, limit: int = 20, db: Session = Depends(get_db)):
    """
    First, will query in database. If the database has results, return them.
    If the database is empty, then it will call OpenFoodFacts, insert results into DB, and return them.

    Returns a clean, typed list of foods.
    Frontend will use this to render interactable rows.
    """
    trimmed = query.strip()
    if not trimmed:
        return FoodSearchResponse(results = [])
    
    db_foods = db.query(Food).filter(Food.name.ilike(f"%{trimmed}%")).limit(limit).all()

    if db_foods:
        results = []
        for food in db_foods:
            results.append(
                FoodSearchItem(
                    id = food.id,
                    openfood_code = food.openfood_code,
                    name = food.name,
                    calories_per_100g = float(food.calories_per_100g),
                )
            )
        return FoodSearchResponse(results = results)

    raw_results = search_openfoodfacts(trimmed)
    foods: list[Food] = []

    for p in raw_results:
        food = upsert_food(product = p, db = db)
        foods.append(food)

    if foods:
        db.commit()
        for food in foods:
            db.refresh(food)

    results = []
    for food in foods:
        results.append(
            FoodSearchItem(
                id = food.id,
                openfood_code = food.openfood_code,
                name = food.name,
                calories_per_100g = float(food.calories_per_100g),
            )
        )

    return FoodSearchResponse(results = results)

@router.get("/search/{code}", response_model = FoodItem)
def get_food_details(code: str, db: Session = Depends(get_db)):
    """
    Fetch full details for a single product by code.
    First, look up food by openfood_code in database.
    If not found, then call OpenFoodFacts, call upsert_food(), and save to DB.
    """
    food = db.query(Food).filter(Food.openfood_code == code).first()

    if food is None:
        try:
            product = nutrition_api.product.get(code)
        except ReadTimeout:
            raise HTTPException(
                status_code=504,
                detail="OpenFoodFacts request timed out. Please try again."
            )
        except RequestException as e:
            raise HTTPException(
                status_code=502,
                detail=f"OpenFoodFacts request failed: {e}"
            )

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        food = upsert_food(product = product, db = db)
        db.commit()
        db.refresh(food)


    return FoodItem(
        id = food.id,
        openfood_code = food.openfood_code,
        name = food.name,
        calories_per_100g = float(food.calories_per_100g),
        protein_per_100g = float(food.protein_per_100g),
        carbs_per_100g = float(food.carbs_per_100g),
        fats_per_100g = float(food.fats_per_100g),
        allergens = food.allergens or "",
    )