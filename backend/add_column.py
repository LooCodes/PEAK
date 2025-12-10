from db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE users ADD COLUMN last_challenge_completed_at TIMESTAMP WITH TIME ZONE'))
    conn.commit()
    print("✅ Successfully added last_challenge_completed_at column to users table")
