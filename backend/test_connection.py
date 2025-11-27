import os
import asyncio
import re
from sqlalchemy import text
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("Using DATABASE_URL:", repr(DATABASE_URL))

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is empty or not set")

# SQLAlchemy 2.0 engine
engine = create_engine(DATABASE_URL, future=True)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connection successful! Result:", list(result))
except Exception as e:
    print("Connection FAILED:")
    print(e)
