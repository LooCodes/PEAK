from db.session import engine
from db.base import Base

from models import *

def main():
    print("Creating tables in the database...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    main()
