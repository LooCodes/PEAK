# Weekly Leaderboard Reset System

## Overview
The leaderboard automatically resets every Monday at midnight UTC. However, the system now includes safeguards and manual options.

## How It Works

### Automatic Reset (Recommended)
1. The scheduler runs when the backend server starts
2. It checks if a reset is needed for the current week
3. If the last reset was before this Monday, it resets automatically
4. Then schedules the next reset for the following Monday

### Why It Didn't Reset Before
The scheduler needs the backend server to be running, OR you need to restart the server after Monday for it to check and reset. The new system now checks on every startup.

## Manual Reset Options

### Option 1: Run the Python Script (Fastest)
```bash
cd /Users/jonathanmeneses/PEAK/backend
python3 manual_reset_leaderboard.py
```

This will:
- Show current leaderboard state
- Reset all weekly_xp to 0
- Confirm the reset worked

### Option 2: Use the API Endpoint
```bash
# You need a valid auth token
curl -X POST http://localhost:8000/api/admin/reset-leaderboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Restart the Backend Server
The system now checks on startup if a reset is needed:
```bash
cd /Users/jonathanmeneses/PEAK/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Look for this in the logs:
```
[Scheduler] Checking if weekly reset is needed...
[2025-12-09...] Weekly leaderboard reset completed. X users reset.
```

## Checking Last Reset
```bash
curl http://localhost:8000/api/admin/last-reset \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Important Notes
1. The `leaderboard_resets` table tracks when resets happen
2. Resets only happen once per week (Monday-to-Monday)
3. The system prevents duplicate resets in the same week
4. All user `weekly_xp` values go to 0, but `total_xp` remains unchanged

## Troubleshooting
If the leaderboard isn't resetting:
1. Check if the backend server was running on Monday at midnight UTC
2. Restart the server - it will auto-check and reset if needed
3. Run the manual script if you need immediate reset
4. Check logs for scheduler errors
