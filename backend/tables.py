from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base

# Example with SQLite (in-memory database)
engine = create_engine("sqlite:///:memory:") # connect to our future cloud based database

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, unique=True, primary_key=True)
    username = Column(String, unique=True, nullable=False, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)


    def __init__(self):
        self.meals = []
        self.streak = 0
        

class Challenge(Base):
    __tablename__ = 'challenge'

    challenge_id = Column(Integer, unique=True, primary_key=True)
    challenge_type = Column(String, nullable = False, unique = True)
    description = Column(String, nullable = True)

class Workout(Base):
    __tablename__ = 'workouts'

    workout_id = Column(Integer, unique=True, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.id"), unique=True)
    duration = Column(Integer, nullable = True)
    weightUsed = Column(Integer, nullable = True)
    reps = Column(Integer, nullable = True)
    sets = Column(Integer, nullable = True)
    caloriesBurned = Column(Integer, nullable = True)

class WorkoutExercises(Base):
    __tablename__ = 'workout_exercises'

    workout_id = Column(Integer, ForeignKey("workouts.workout_id"), unique=True, primary_key=True)
    exercise_id = Column(Integer, ForeignKey("exercise.exercise_id"), unique=True, primary_key=True)

class FoodItem(Base):
    __tablename__ = 'food_item'

    food_id = Column(Integer, unique=True, primary_key=True)
    food_name = Column(String, nullable = True)
    calories = Column(Integer, nullable = True)
    protein = Column(Integer, nullable = True)
    carbs = Column(Integer, nullable = True)
    fats = Column(Integer, nullable = True)
    allergens = Column(String, nullable = True)

class MealItem(Base):
    __tablename__ = 'meal_item'

    meal_id = Column(Integer, ForeignKey("meal.meal_id"), unique=True, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_item.food_id"), unique=True, primary_key=True)
    quantity = Column(Integer, nullable = True)


class Meal(Base):
    __tablename__ = "Meals"

    meal_id = Column(Integer, unique=True, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
    total_calories = Column(Integer, nullable=False)
    total_protein = Column(Integer, nullable=False)
    total_carbs = Column(Integer, nullable=False)
    total_fats = Column(Integer, nullable=False)
    allergens = Column(String, nullable=False)

class Exercise(Base):
    __tablename__ = "Exercises"

    exercise_id = Column(Integer, unique=True, primary_key=True)
    name = Column(String, unique=True, primary_key=True)
    type = Column(String, nullable=False)
    muscle_group = Column(String, nullable=False)