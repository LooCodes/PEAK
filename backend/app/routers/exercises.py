# backend/app/routers/exercises.py
from fastapi import APIRouter, Depends, HTTPException, Query
import json
from sqlalchemy.orm import Session
from typing import Optional, List
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

# --------- ExerciseDB API config ---------
EXERCISEDB_API_KEY = os.getenv("EXERCISEDB_API_KEY")
EXERCISEDB_API_HOST = os.getenv(
    "EXERCISEDB_API_HOST", "exercisedb-api1.p.rapidapi.com"
)
EXERCISEDB_BASE_URL = f"https://{EXERCISEDB_API_HOST}/api/v1"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Helpers for ExerciseDB ----------


def _get_headers() -> dict:
    return {
        "X-RapidAPI-Key": EXERCISEDB_API_KEY or "",
        "X-RapidAPI-Host": EXERCISEDB_API_HOST,
    }


def fetch_exercisedb_search(query: str, limit: int = 50):
    """
    Search exercises via ExerciseDB v1:
      GET /exercises/search?search=...&limit=...

    We do *no* filtering here. Just return the raw list from the API.
    """
    if not EXERCISEDB_API_KEY:
        print("No EXERCISEDB_API_KEY set, skipping ExerciseDB API call")
        return None

    headers = _get_headers()
    url = f"{EXERCISEDB_BASE_URL}/exercises/search"
    params = {"search": query, "limit": limit}

    try:
        resp = requests.get(url, headers=headers, params=params)
        print("SEARCH status:", resp.status_code, "for query:", query)

        if resp.status_code != 200:
            print("ExerciseDB search error:", resp.status_code, "-", resp.text[:300])
            return None

        data = resp.json()
        if not isinstance(data, dict) or "data" not in data:
            print("Unexpected search response format:", data)
            return None

        results = data["data"]  # list[dict]
        print(f"SEARCH returned {len(results)} exercises")
        return results

    except Exception as e:
        print(f"Error fetching from ExerciseDB search: {e}")
        return None


def fetch_exercisedb_detail(exercise_id: str):
    """
    Fetch full details for a single exercise:
      GET /exercises/{exerciseId}

    Includes overview, instructions, etc.
    """
    if not EXERCISEDB_API_KEY:
        print("No EXERCISEDB_API_KEY set, skipping ExerciseDB detail call")
        return None

    headers = _get_headers()
    url = f"{EXERCISEDB_BASE_URL}/exercises/{exercise_id}"

    try:
        resp = requests.get(url, headers=headers)
        print("DETAIL status:", resp.status_code, "for", exercise_id)

        if resp.status_code != 200:
            print("Detail API error:", resp.status_code, "-", resp.text[:300])
            return None

        data = resp.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return None

    except Exception as e:
        print(f"Error fetching detail for {exercise_id}: {e}")
        return None


def map_exercisedb_to_exercise(api_exercise: dict, index: int) -> dict:
    """
    Map ExerciseDB v1 object (search or detail) to our internal Exercise format.
    """
    exercise_id = api_exercise.get("exerciseId", "")
    name = (api_exercise.get("name") or "").strip()
    image_url = api_exercise.get("imageUrl")

    # Body part
    body_parts = api_exercise.get("bodyParts") or []
    primary_body_raw = body_parts[0] if body_parts else None

    if primary_body_raw:
        body_part = (
            primary_body_raw.title()
            .replace("_", " ")
            .replace("-", " ")
        )
    else:
        body_part = None

    # Muscle group
    target_muscles = api_exercise.get("targetMuscles") or []
    muscle_group = target_muscles[0] if target_muscles else (primary_body_raw or "")

    # Equipment bucketing
    equipments = api_exercise.get("equipments") or []
    equipments_lower = " ".join(e.lower() for e in equipments)

    if any(w in equipments_lower for w in ["dumbbell", "barbell", "kettlebell", "ez barbell"]):
        equipment_type = "Free Weights"
    elif any(w in equipments_lower for w in ["machine", "cable", "sled", "smith"]):
        equipment_type = "Machine"
    elif "band" in equipments_lower:
        equipment_type = "Bands"
    else:
        equipment_type = "At Home"

    exercise_type = (api_exercise.get("exerciseType") or "strength").title()
    instructions = api_exercise.get("instructions") or []

    return {
        "id": index + 1,  # local index for this response
        "name": name,
        "type": exercise_type,
        "muscle_group": muscle_group,
        "body_part": body_part,
        "equipment_type": equipment_type,
        "thumbnail_url": image_url,
        "gif_url": image_url,
        "instructions": instructions,
        "external_id": exercise_id,
    }

def get_or_create_exercise_from_external(
    db: Session,
    external_id: str,
) -> Exercise:
    """
    Given an ExerciseDB exerciseId (external_id), either:
    - return existing Exercise row, or
    - fetch detail from ExerciseDB, insert into `exercises`, and return it.
    """

    # 1) Try existing record by external_id
    existing = db.query(Exercise).filter(Exercise.external_id == external_id).first()
    if existing:
        return existing

    # 2) Fetch from ExerciseDB detail endpoint
    detail = fetch_exercisedb_detail(external_id)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail="Could not fetch exercise details from ExerciseDB.",
        )

    # 3) Map API object to our internal shape
    mapped = map_exercisedb_to_exercise(detail, index=0)

    # 4) Prepare instructions as JSON text (your column is Text)
    instructions_list = mapped.get("instructions") or []
    instructions_text = json.dumps(instructions_list)

    # 5) Create Exercise row
    ex = Exercise(
        name=mapped["name"],
        type=mapped["type"],
        muscle_group=mapped["muscle_group"] or "Unknown",
        body_part=mapped.get("body_part"),
        equipment_type=mapped.get("equipment_type"),
        thumbnail_url=mapped.get("thumbnail_url"),
        gif_url=mapped.get("gif_url"),
        instructions=instructions_text,
        external_id=mapped.get("external_id") or external_id,
    )

    db.add(ex)
    db.commit()
    db.refresh(ex)

    return ex

# ---------- Mock data (fallback) ----------

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
            "Lower the dumbbells to chest level, then press back up while keeping control.",
        ],
        "external_id": "0001",
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
            "Push through your heels to return to starting position.",
        ],
        "external_id": "0002",
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
            "Lower yourself back down with control.",
        ],
        "external_id": "0003",
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
            "Lower the weights back down with control.",
        ],
        "external_id": "0004",
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
            "Lower back to starting position with control.",
        ],
        "external_id": "0005",
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
            "Cool down with a 5-minute walk.",
        ],
        "external_id": "0006",
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
            "Push back up to starting position.",
        ],
        "external_id": "0007",
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
            "Slowly return the bar to starting position.",
        ],
        "external_id": "0008",
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
            "Perform squats while maintaining tension in the band.",
        ],
        "external_id": "0009",
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
            "Push back up to starting position.",
        ],
        "external_id": "0010",
    },
]


# ---------- Routes ----------


@router.get("/", response_model=ExerciseListResponse)
def get_exercises(
    query: Optional[str] = Query(
        None,
        description="Search term for exercises (e.g., 'bench press', 'squat')",
    ),
    db: Session = Depends(get_db),
):
    """
    Get list of exercises using only an optional search term.

    - If query is provided: search by that term.
    - Else: generic 'exercise' search.

    We only fall back to MOCK_EXERCISES if the API call failed (returned None),
    not when it just returned an empty list.
    """
    search_term = query if query else "exercise"

    api_exercises = fetch_exercisedb_search(search_term, limit=80)

    if api_exercises is not None:
        mapped_exercises = [
            map_exercisedb_to_exercise(ex, idx)
            for idx, ex in enumerate(api_exercises)
        ]
    else:
        print("Falling back to mock data")
        mapped_exercises = MOCK_EXERCISES

    exercise_responses: List[ExerciseResponse] = []
    for ex in mapped_exercises:
        exercise_responses.append(
            ExerciseResponse(
                id=ex["id"],
                name=ex["name"],
                type=ex["type"],
                muscle_group=ex["muscle_group"],
                body_part=ex.get("body_part"),
                equipment_type=ex.get("equipment_type"),
                thumbnail_url=ex.get("thumbnail_url"),
                gif_url=ex.get("gif_url"),
                instructions=ex.get("instructions", []),
                external_id=ex.get("external_id"),
                created_at=datetime.now(),
            )
        )

    return ExerciseListResponse(exercises=exercise_responses)


@router.get("/saved", response_model=ExerciseListResponse)
def get_saved_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all exercises that the current user has saved (i.e., added to their workouts).
    This uses the `user_workout_exercises` table joined with `exercises`.
    """
    # Join UserWorkoutExercise -> Exercise
    saved_exercises = (
        db.query(Exercise)
        .join(
            UserWorkoutExercise,
            UserWorkoutExercise.exercise_id == Exercise.id,
        )
        .filter(UserWorkoutExercise.user_id == current_user.id)
        .order_by(Exercise.name.asc())
        .all()
    )

    exercise_responses: List[ExerciseResponse] = []

    for ex in saved_exercises:
        # instructions are stored as JSON text in the DB
        try:
            instr = json.loads(ex.instructions) if ex.instructions else []
        except Exception:
            instr = []

        exercise_responses.append(
            ExerciseResponse(
                id=ex.id,
                name=ex.name,
                type=ex.type,
                muscle_group=ex.muscle_group,
                body_part=ex.body_part,
                equipment_type=ex.equipment_type,
                thumbnail_url=ex.thumbnail_url,
                gif_url=ex.gif_url,
                instructions=instr,
                external_id=ex.external_id,
                created_at=ex.created_at,
            )
        )

    return ExerciseListResponse(exercises=exercise_responses)



@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise_by_id(
    exercise_id: str,
    db: Session = Depends(get_db),
):
    """
    Get detailed information for a specific exercise, by ExerciseDB exerciseId.
    If the external API fails, we fall back to mock data (matching external_id or id).
    """
    detail = fetch_exercisedb_detail(exercise_id)
    if detail:
        mapped = map_exercisedb_to_exercise(detail, index=0)
        return ExerciseResponse(
            id=mapped["id"],
            name=mapped["name"],
            type=mapped["type"],
            muscle_group=mapped["muscle_group"],
            body_part=mapped.get("body_part"),
            equipment_type=mapped.get("equipment_type"),
            thumbnail_url=mapped.get("thumbnail_url"),
            gif_url=mapped.get("gif_url"),
            instructions=mapped.get("instructions", []),
            external_id=mapped.get("external_id"),
            created_at=datetime.now(),
        )

    # Fallback: look in mock data
    exercise = None

    for e in MOCK_EXERCISES:
        if e.get("external_id") == exercise_id:
            exercise = e
            break

    if exercise is None and exercise_id.isdigit():
        num_id = int(exercise_id)
        exercise = next((e for e in MOCK_EXERCISES if e["id"] == num_id), None)

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
        instructions=exercise.get("instructions", []),
        external_id=exercise.get("external_id"),
        created_at=datetime.now(),
    )


@router.post("/user/workout-exercises", response_model=AddExerciseResponse)
def add_exercise_to_workout(
    exercise_data: UserWorkoutExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add an exercise to the user's workout plan.

    We treat `exercise_data.exercise_id` as:
    - the ExerciseDB exerciseId (string), e.g. "exr_41n2h...",
      or as a fallback, a numeric id of a local Exercise.
    """

    # Normalize to string so we can use it for external_id when needed
    raw_id = str(exercise_data.exercise_id)

    # If it looks like an ExerciseDB id (starts with "exr_"), treat as external_id
    if raw_id.startswith("exr_"):
        exercise_row = get_or_create_exercise_from_external(db, raw_id)
    else:
        # Fallback: assume it's a local exercises.id
        exercise_row = db.query(Exercise).filter(Exercise.id == int(raw_id)).first()
        if not exercise_row:
            raise HTTPException(status_code=404, detail="Exercise not found")

    # Check if user already has this exercise in their workout
    existing = (
        db.query(UserWorkoutExercise)
        .filter(
            UserWorkoutExercise.user_id == current_user.id,
            UserWorkoutExercise.exercise_id == exercise_row.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Exercise already added to your workout"
        )

    # Create user_workout_exercises row
    workout_exercise = UserWorkoutExercise(
        user_id=current_user.id,
        exercise_id=exercise_row.id,  # numeric FK to exercises.id
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
            created_at=workout_exercise.created_at,
        ),
    )

