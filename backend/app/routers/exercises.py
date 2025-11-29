from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import requests
from datetime import datetime
import os

from db.database import SessionLocal
from models.exercise import Exercise, UserWorkoutExercise
from models.user import User
from schemas.exercise import (
    ExerciseResponse,
    ExerciseListResponse,
    UserWorkoutExerciseCreate,
    AddExerciseResponse,
    UserWorkoutExerciseResponse,
)
from auth import get_current_user

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

# ExerciseDB API configuration
EXERCISEDB_API_KEY = os.getenv("EXERCISEDB_API_KEY")
EXERCISEDB_API_HOST = os.getenv("EXERCISEDB_API_HOST", "exercisedb.p.rapidapi.com")
EXERCISEDB_BASE_URL = f"https://{EXERCISEDB_API_HOST}"

# Body part mapping from our UI to ExerciseDB API
BODY_PART_MAP = {
    "Chest": "chest",
    "Back": "back",
    "Legs": ["upper legs", "lower legs"],
    "Arms": ["upper arms", "lower arms"],
    "Shoulders": "shoulders",
    "Cardio": "cardio",
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_exercisedb_exercises(body_part: Optional[str] = None, limit: int = 50):
    """Fetch exercises from ExerciseDB API"""
    if not EXERCISEDB_API_KEY:
        return None

    headers = {
        "X-RapidAPI-Key": EXERCISEDB_API_KEY,
        "X-RapidAPI-Host": EXERCISEDB_API_HOST
    }

    try:
        if body_part:
            # Map our body part to ExerciseDB body parts
            api_body_parts = BODY_PART_MAP.get(body_part, body_part.lower())
            if isinstance(api_body_parts, list):
                # For body parts like Legs/Arms that map to multiple API body parts
                all_exercises = []
                for api_bp in api_body_parts:
                    url = f"{EXERCISEDB_BASE_URL}/exercises/bodyPart/{api_bp}"
                    response = requests.get(url, headers=headers, params={"limit": limit // len(api_body_parts)})
                    if response.status_code == 200:
                        all_exercises.extend(response.json())
                return all_exercises
            else:
                url = f"{EXERCISEDB_BASE_URL}/exercises/bodyPart/{api_body_parts}"
                response = requests.get(url, headers=headers, params={"limit": limit})
        else:
            url = f"{EXERCISEDB_BASE_URL}/exercises"
            response = requests.get(url, headers=headers, params={"limit": limit})

        if response.status_code == 200:
            return response.json()
        else:
            print(f"ExerciseDB API Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching from ExerciseDB: {e}")
        return None


def map_exercisedb_to_exercise(api_exercise: dict, index: int) -> dict:
    """Map ExerciseDB API response to our Exercise format"""
    # NOTE: ExerciseDB RapidAPI free tier doesn't include access to the image endpoint
    # Using placeholder images based on exercise name/ID
    # To get real GIFs, you need a paid ExerciseDB subscription or use an alternative like wger
    exercise_id = api_exercise.get("id", "")
    exercise_name = api_exercise.get("name", "exercise")

    # Map body part for color-coded placeholders
    api_body_part = api_exercise.get("bodyPart", "")

    # Use placeholder.co with exercise name and body part color coding
    # This provides a cleaner, more professional look than random shapes
    color_map = {
        "chest": "3b82f6",      # blue
        "back": "10b981",        # green
        "waist": "8b5cf6",       # purple
        "upper legs": "f59e0b",  # amber
        "lower legs": "f59e0b",  # amber
        "upper arms": "ec4899",  # pink
        "lower arms": "ec4899",  # pink
        "shoulders": "06b6d4",   # cyan
        "cardio": "ef4444",      # red
    }
    color = color_map.get(api_body_part, "6b7280")  # gray as default

    # Create a simple colored placeholder with exercise name initial
    # Using via.placeholder.com for better-looking placeholders
    gif_url = f"https://via.placeholder.com/300x300/{color}/ffffff?text={exercise_name[:20].replace(' ', '+')}"

    # Map body part to our categories
    if api_body_part in ["upper legs", "lower legs"]:
        body_part = "Legs"
    elif api_body_part in ["upper arms", "lower arms"]:
        body_part = "Arms"
    else:
        body_part = api_body_part.capitalize()

    # Map equipment to our categories
    equipment = api_exercise.get("equipment", "")
    if equipment in ["body weight", "assisted"]:
        equipment_type = "At Home"
    elif equipment in ["dumbbell", "barbell", "kettlebell", "ez barbell"]:
        equipment_type = "Free Weights"
    elif equipment in ["cable", "leverage machine", "sled machine", "smith machine"]:
        equipment_type = "Machine"
    elif equipment == "band":
        equipment_type = "Bands"
    else:
        equipment_type = "At Home"

    return {
        "id": index + 1,  # Use index as internal ID
        "name": api_exercise.get("name", "").title(),
        "type": api_exercise.get("category", "strength"),
        "muscle_group": api_exercise.get("target", ""),
        "body_part": body_part,
        "equipment_type": equipment_type,
        "thumbnail_url": gif_url,
        "gif_url": gif_url,
        "instructions": api_exercise.get("instructions", []),
        "external_id": exercise_id
    }


# Mock data for development
# TODO: Replace with ExerciseDB API integration
# To use real exercise GIFs, sign up for RapidAPI ExerciseDB and add your key to .env
MOCK_EXERCISES = [
    {
        "id": 1,
        "name": "Incline Dumbbell Bench Press",
        "type": "strength",
        "muscle_group": "chest",
        "body_part": "Chest",
        "equipment_type": "Free Weights",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=chest1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=chest1",
        "instructions": [
            "Set an adjustable bench to a 30-45 degree incline.",
            "Lie back holding dumbbells above your chest with arms extended.",
            "Lower the dumbbells to chest level, then press back up while keeping control."
        ],
        "external_id": "0001"
    },
    {
        "id": 2,
        "name": "Barbell Squat",
        "type": "strength",
        "muscle_group": "legs",
        "body_part": "Legs",
        "equipment_type": "Free Weights",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=legs1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=legs1",
        "instructions": [
            "Position the barbell on your upper back/traps.",
            "Stand with feet shoulder-width apart.",
            "Lower your body by bending your knees and hips.",
            "Push through your heels to return to starting position."
        ],
        "external_id": "0002"
    },
    {
        "id": 3,
        "name": "Pull-ups",
        "type": "strength",
        "muscle_group": "back",
        "body_part": "Back",
        "equipment_type": "At Home",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=back1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=back1",
        "instructions": [
            "Hang from a pull-up bar with palms facing away.",
            "Pull your body up until your chin is above the bar.",
            "Lower yourself back down with control."
        ],
        "external_id": "0003"
    },
    {
        "id": 4,
        "name": "Dumbbell Bicep Curl",
        "type": "strength",
        "muscle_group": "arms",
        "body_part": "Arms",
        "equipment_type": "Free Weights",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=arms1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=arms1",
        "instructions": [
            "Stand with dumbbells at your sides, palms facing forward.",
            "Curl the weights up towards your shoulders.",
            "Lower the weights back down with control."
        ],
        "external_id": "0004"
    },
    {
        "id": 5,
        "name": "Shoulder Press Machine",
        "type": "strength",
        "muscle_group": "shoulders",
        "body_part": "Shoulders",
        "equipment_type": "Machine",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=shoulders1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=shoulders1",
        "instructions": [
            "Sit on the machine with back against the pad.",
            "Grip the handles at shoulder height.",
            "Press the handles upward until arms are extended.",
            "Lower back to starting position with control."
        ],
        "external_id": "0005"
    },
    {
        "id": 6,
        "name": "Running",
        "type": "cardio",
        "muscle_group": "cardio",
        "body_part": "Cardio",
        "equipment_type": "At Home",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=cardio1",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=cardio1",
        "instructions": [
            "Start with a 5-minute warm-up walk.",
            "Gradually increase your pace to a comfortable running speed.",
            "Maintain good posture with shoulders relaxed.",
            "Cool down with a 5-minute walk."
        ],
        "external_id": "0006"
    },
    {
        "id": 7,
        "name": "Push-ups",
        "type": "strength",
        "muscle_group": "chest",
        "body_part": "Chest",
        "equipment_type": "At Home",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=chest2",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=chest2",
        "instructions": [
            "Start in a plank position with hands shoulder-width apart.",
            "Lower your body until chest nearly touches the floor.",
            "Push back up to starting position."
        ],
        "external_id": "0007"
    },
    {
        "id": 8,
        "name": "Lat Pulldown Machine",
        "type": "strength",
        "muscle_group": "back",
        "body_part": "Back",
        "equipment_type": "Machine",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=back2",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=back2",
        "instructions": [
            "Sit at the lat pulldown machine and grip the bar wider than shoulder-width.",
            "Pull the bar down to your upper chest.",
            "Slowly return the bar to starting position."
        ],
        "external_id": "0008"
    },
    {
        "id": 9,
        "name": "Resistance Band Squats",
        "type": "strength",
        "muscle_group": "legs",
        "body_part": "Legs",
        "equipment_type": "Bands",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=legs2",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=legs2",
        "instructions": [
            "Stand on resistance band with feet shoulder-width apart.",
            "Hold the other end of the band at shoulder level.",
            "Perform squats while maintaining tension in the band."
        ],
        "external_id": "0009"
    },
    {
        "id": 10,
        "name": "Tricep Dips",
        "type": "strength",
        "muscle_group": "arms",
        "body_part": "Arms",
        "equipment_type": "At Home",
        "thumbnail_url": "https://api.dicebear.com/7.x/shapes/svg?seed=arms2",
        "gif_url": "https://api.dicebear.com/7.x/shapes/svg?seed=arms2",
        "instructions": [
            "Place hands on a bench or chair behind you.",
            "Lower your body by bending your elbows.",
            "Push back up to starting position."
        ],
        "external_id": "0010"
    }
]


@router.get("/", response_model=ExerciseListResponse)
def get_exercises(
    body_part: Optional[str] = Query(None, description="Filter by body part (e.g., Chest, Back, Legs, Arms, Shoulders, Cardio)"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type (e.g., At Home, Free Weights, Machine, Bands)"),
    db: Session = Depends(get_db),
):
    """
    Get list of exercises with optional filters.
    Uses ExerciseDB API for real exercise data with GIFs.
    """
    # Try to fetch from ExerciseDB API first
    api_exercises = fetch_exercisedb_exercises(body_part=body_part, limit=100)

    if api_exercises:
        # Map API exercises to our format
        mapped_exercises = [map_exercisedb_to_exercise(ex, idx) for idx, ex in enumerate(api_exercises)]

        # Apply equipment filter if provided
        if equipment_type:
            mapped_exercises = [e for e in mapped_exercises if e.get("equipment_type", "").lower() == equipment_type.lower()]

    else:
        # Fallback to mock data if API fails
        print("Falling back to mock data")
        filtered_exercises = MOCK_EXERCISES

        if body_part:
            filtered_exercises = [e for e in filtered_exercises if e.get("body_part", "").lower() == body_part.lower()]

        if equipment_type:
            filtered_exercises = [e for e in filtered_exercises if e.get("equipment_type", "").lower() == equipment_type.lower()]

        mapped_exercises = filtered_exercises

    # Convert to response models
    exercise_responses = []
    for ex in mapped_exercises:
        exercise_responses.append(ExerciseResponse(
            id=ex["id"],
            name=ex["name"],
            type=ex["type"],
            muscle_group=ex["muscle_group"],
            body_part=ex.get("body_part"),
            equipment_type=ex.get("equipment_type"),
            thumbnail_url=ex.get("thumbnail_url"),
            gif_url=ex.get("gif_url"),
            instructions=ex.get("instructions"),
            external_id=ex.get("external_id"),
            created_at=datetime.now()
        ))

    return ExerciseListResponse(exercises=exercise_responses)


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise_by_id(
    exercise_id: int,
    db: Session = Depends(get_db),
):
    """
    Get detailed information for a specific exercise.
    """
    # Find exercise in mock data
    exercise = next((e for e in MOCK_EXERCISES if e["id"] == exercise_id), None)

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    return ExerciseResponse(
        id=exercise["id"],
        name=exercise["name"],
        type=exercise["type"],
        muscle_group=exercise["muscle_group"],
        body_part=exercise.get("body_part"),
        equipment_type=exercise.get("equipment_type"),
        thumbnail_url=exercise.get("thumbnail_url"),
        gif_url=exercise.get("gif_url"),
        instructions=exercise.get("instructions"),
        external_id=exercise.get("external_id"),
        created_at=datetime.now()
    )


@router.post("/user/workout-exercises", response_model=AddExerciseResponse)
def add_exercise_to_workout(
    exercise_data: UserWorkoutExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add an exercise to the user's workout plan.
    Requires authentication.
    """
    # Check if exercise exists in mock data
    exercise = next((e for e in MOCK_EXERCISES if e["id"] == exercise_data.exercise_id), None)

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    # Check if user already added this exercise
    existing = db.query(UserWorkoutExercise).filter(
        UserWorkoutExercise.user_id == current_user.id,
        UserWorkoutExercise.exercise_id == exercise_data.exercise_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Exercise already added to your workout")

    # Create workout exercise entry
    workout_exercise = UserWorkoutExercise(
        user_id=current_user.id,
        exercise_id=exercise_data.exercise_id,
    )

    db.add(workout_exercise)
    db.commit()
    db.refresh(workout_exercise)

    return AddExerciseResponse(
        status="ok",
        message="Exercise added to workout",
        workout_exercise=UserWorkoutExerciseResponse(
            id=workout_exercise.id,
            user_id=workout_exercise.user_id,
            exercise_id=workout_exercise.exercise_id,
            created_at=workout_exercise.created_at
        )
    )
