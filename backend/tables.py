from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
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
        meals = []





