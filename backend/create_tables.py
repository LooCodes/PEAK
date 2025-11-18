from db.session import engine
from db.base import Base

# Import all models so they register with Base.metadata
from models import *  # noqa: F401,F403

def main():
    print("Creating tables in the database...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    main()
