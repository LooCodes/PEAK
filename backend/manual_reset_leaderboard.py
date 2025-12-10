#!/usr/bin/env python3
"""
Manual script to reset the weekly leaderboard immediately.
Run this with: python3 manual_reset_leaderboard.py
"""

import sys
import os

# Add the backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from sqlalchemy import update
from db.session import SessionLocal
from db.base import Base
from db import engine
from models.user import User

def manual_reset():
    """Manually reset all users' weekly_xp to 0"""
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("\n=== BEFORE RESET ===")
        users = db.query(User.username, User.weekly_xp).filter(User.weekly_xp > 0).all()
        total_before = sum(xp for _, xp in users)
        print(f"Users with points: {len(users)}")
        for username, weekly_xp in users[:10]:  # Show first 10
            print(f"  {username}: {weekly_xp} pts")
        if len(users) > 10:
            print(f"  ... and {len(users) - 10} more")
        print(f"Total weekly_xp: {total_before}")
        
        print("\n=== RESETTING ALL weekly_xp TO 0 ===")
        result = db.execute(update(User).values(weekly_xp=0))
        db.commit()
        print(f"✅ Reset {result.rowcount} users")
        
        print("\n=== AFTER RESET ===")
        users_after = db.query(User.username, User.weekly_xp).filter(User.weekly_xp > 0).all()
        total_after = sum(xp for _, xp in users_after)
        
        if total_after == 0 and len(users_after) == 0:
            print("✅ SUCCESS! All users have 0 weekly_xp.")
            print("   Leaderboard reset complete!")
        else:
            print(f"⚠️  Warning: {len(users_after)} users still have points")
            print(f"   Total weekly_xp: {total_after}")
            
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    manual_reset()
