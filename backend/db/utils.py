# backend/db/utils.py
from datetime import date, timedelta

def get_current_week_range():
    """Return (monday, sunday) for the current week."""
    today = date.today()
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=6)                  # Sunday
    return start, end
