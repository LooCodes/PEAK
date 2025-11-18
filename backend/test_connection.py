from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

print("Using DATABASE_URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1;")
        print("Connection successful! Result:", list(result))
except Exception as e:
    print("Connection FAILED:")
    print(e)
