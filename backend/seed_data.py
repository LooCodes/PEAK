# backend/seed_data.py

from datetime import datetime, timedelta, timezone

from db import SessionLocal, Base, engine
from models import User, Meal, Workout

# Optional: ensure tables exist (safe if they already do)
Base.metadata.create_all(bind=engine)


def get_or_create_test_user(db):
    username = "admin"
    email = "admin@gmail.com"

    user = db.query(User).filter_by(username=username).first()
    if user:
        print(f"Using existing user: {user.username} (id={user.id})")
        return user

    user = User(
        username=username,
        email=email,
        password_hash="123",  # TODO: replace with real hash later
        age=22,
        weight=70,
        height=170,
        streak=5,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created new user: {user.username} (id={user.id})")
    return user


def seed_meals(db, user):
    now = datetime.now(timezone.utc)

    # 3 meals on different days
    meal_times = [
        now - timedelta(days=3),
        now - timedelta(days=1),
        now,
    ]

    for dt in meal_times:
        meal = Meal(
            user_id=user.id,
            eaten_at=dt,
        )
        db.add(meal)

    db.commit()
    print(f"Inserted {len(meal_times)} meals for user_id={user.id}")


def seed_workouts(db, user):
    now = datetime.now(timezone.utc)

    workout_times = [
        now - timedelta(days=4),
        now - timedelta(days=2),
        now,
    ]

    for dt in workout_times:
        workout = Workout(
            user_id=user.id,
            performed_at=dt,
            notes="Test workout",
        )
        db.add(workout)

    db.commit()
    print(f"Inserted {len(workout_times)} workouts for user_id={user.id}")


def main():
    db = SessionLocal()
    try:
        user = get_or_create_test_user(db)
        seed_meals(db, user)
        seed_workouts(db, user)
    finally:
        db.close()


if __name__ == "__main__":
    main()
