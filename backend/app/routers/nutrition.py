from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from openfoodfacts import API, Country, Flavor, APIVersion, Environment
from requests.exceptions import ReadTimeout, RequestException
from schemas.nutrition import FoodSearchItem, FoodSearchResponse, FoodItem

"""
TODO:
- Make it so that if a user "ADDS" to their meal logger, food item is added to database.
- Make frontend to nutrition section
"""

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

nutrition_api = API(
    user_agent="PEAK/1.0",
    username=None,
    password=None,
    country=Country.world,
    flavor=Flavor.off,
    version=APIVersion.v2,
    environment=Environment.org,
    timeout=30,
)

def search_openfoodfacts(query: str, limit: int = 20):
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


@router.get("/search", response_model=FoodSearchResponse)
def search_foods(query: str):
    """
    Returns a clean, typed list of foods based on OpenFoodFacts.
    Frontend will use this to render interactable rows.
    """
    raw_results = search_openfoodfacts(query)
    results: list[FoodSearchItem] = []

    for p in raw_results:
        nutr = p.get("nutriments", {}) or {}

        item = FoodSearchItem(
            code=p.get("code"),
            name=p.get("product_name", "Unknown"),
        )

        results.append(item)

    return FoodSearchResponse(results=results)

@router.get("/search/{code}", response_model=FoodItem)
def get_product_details(code: str):
    """
    Fetch full details for a single product by code.
    """
    product = nutrition_api.product.get(code)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    macros = product.get("nutriments", {}) or {}

    return FoodItem(
        code=product.get("code"),
        name=product.get("product_name", "Unknown"),
        calories_per_100g=macros.get("energy-kcal_100g"),
        protein_per_100g=macros.get("proteins_100g"),
        carbs_per_100g=macros.get("carbohydrates_100g"),
        fats_per_100g=macros.get("fat_100g"),
        allergens=product.get("allergens", ""),
    )