import os
from dotenv import load_dotenv

# Load .env from the backend root
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
NUTRITION_API_KEY = os.getenv("NUTRITION_API_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in the .env file")
if not NUTRITION_API_KEY:
    raise RuntimeError("NUTRITION_API_KEY is not set in the .env file")