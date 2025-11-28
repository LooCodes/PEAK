from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from db import SessionLocal
from models import Food, Meal, MealItem, Workout, WorkoutSet, Exercise, User


USER_ID = 6


def seed_foods(db: Session):
    foods = [
        ("Chicken Breast", 165, 31, 0, 3.6, None),
        ("White Rice", 130, 2.7, 28, 0.3, None),
        ("Broccoli", 34, 2.8, 7, 0.4, None),
        ("Eggs", 155, 13, 1.1, 11, "egg"),
        ("Oatmeal", 68, 2.4, 12, 1.4, "gluten"),
        ("Greek Yogurt", 59, 10, 3.6, 0.4, "dairy"),
        ("Banana", 89, 1.1, 23, 0.3, None),
        ("Salmon", 208, 20, 0, 13, "fish"),
    ]

    result = {}
    for name, cals, p, c, f, allergen in foods:
        food = db.query(Food).filter_by(name=name).first()
        if not food:
            food = Food(
                name=name,
                calories_per_100g=cals,
                protein_per_100g=p,
                carbs_per_100g=c,
                fats_per_100g=f,
                allergens=allergen,
            )
            db.add(food)
            db.flush()

        result[name] = food

    return result


def seed_meals(db: Session, foods):
    today = datetime.utcnow()

    meal_data = [
        (today - timedelta(days=1), ["Chicken Breast", "White Rice", "Broccoli"]),
        (today - timedelta(days=2), ["Eggs", "Oatmeal", "Banana"]),
        (today - timedelta(days=4), ["Salmon", "White Rice"]),
        (today - timedelta(days=6), ["Greek Yogurt", "Banana"]),
    ]

    for dt, items in meal_data:
        meal = Meal(user_id=USER_ID, eaten_at=dt)
        db.add(meal)
        db.flush()

        for food_name in items:
            db.add(
                MealItem(
                    meal_id=meal.id,
                    food_id=foods[food_name].id,
                    qty=150,
                )
            )


def seed_exercises(db: Session):
    exercises = [
        ("Bench Press", "strength", "chest"),
        ("Pull Ups", "strength", "back"),
        ("Squats", "strength", "legs"),
        ("Shoulder Press", "strength", "shoulders"),
        ("Running", "cardio", "full body"),
    ]

    result = {}
    for name, type_, group in exercises:
        ex = db.query(Exercise).filter_by(name=name).first()
        if not ex:
            ex = Exercise(name=name, type=type_, muscle_group=group)
            db.add(ex)
            db.flush()
        result[name] = ex

    return result


def seed_workouts(db: Session, exercises):
    today = datetime.utcnow()

    workouts = [
        (today - timedelta(days=1), ["Bench Press", "Pull Ups"]),
        (today - timedelta(days=3), ["Squats"]),
        (today - timedelta(days=5), ["Running"]),
        (today - timedelta(days=7), ["Shoulder Press", "Bench Press"]),
    ]

    for dt, exercise_names in workouts:
        workout = Workout(user_id=USER_ID, performed_at=dt, notes="Mock workout")
        db.add(workout)
        db.flush()

        set_num = 1
        for ex_name in exercise_names:
            db.add(
                WorkoutSet(
                    workout_id=workout.id,
                    exercise_id=exercises[ex_name].id,
                    set_no=set_num,
                    reps=10,
                    weight=60 if ex_name != "Running" else None,
                    duration_seconds=600 if ex_name == "Running" else None,
                    calories=100 if ex_name == "Running" else None,
                )
            )
            set_num += 1


def main():
    db = SessionLocal()

    user = db.query(User).filter_by(id=USER_ID).first()
    if not user:
        print("❌ User with ID 6 does not exist. Aborting.")
        return

    foods = seed_foods(db)
    seed_meals(db, foods)
    exercises = seed_exercises(db)
    seed_workouts(db, exercises)

    db.commit()
    print("✅ Mock data seeded successfully for user_id=6")


if __name__ == "__main__":
    main()
