#!/usr/bin/env python3
"""
Test script for weekly leaderboard reset functionality.
Run this to manually trigger a reset and verify it works.
"""

import sys
sys.path.insert(0, '/Users/jonathanmeneses/PEAK/backend')

from app.scheduler import reset_weekly_leaderboard
from db.session import SessionLocal
from models.user import User

def test_reset():
    """Test the weekly reset by displaying before/after weekly_xp values"""
    
    db = SessionLocal()
    
    print("\n=== Before Reset ===")
    users = db.query(User).limit(5).all()
    for user in users:
        print(f"User: {user.username}, weekly_xp: {user.weekly_xp}")
    
    db.close()
    
    print("\n=== Running reset_weekly_leaderboard() ===")
    reset_weekly_leaderboard()
    
    db = SessionLocal()
    print("\n=== After Reset ===")
    users = db.query(User).limit(5).all()
    for user in users:
        print(f"User: {user.username}, weekly_xp: {user.weekly_xp}")
    
    db.close()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_reset()
