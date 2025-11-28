from pydantic import BaseModel

class LeaderboardItem(BaseModel):
    username: str
    weekly_points: int
    rank: int



class LeaderboardSummary(BaseModel):
    # Rank in the weekly leaderboard (can be null if user not on board yet)
    rank: int | None
    # From users.weekly_xp
    weekly_xp: int
    # From leaderboard_entries.weekly_points (for consistency / debugging)
    weekly_points: int

    class Config:
        from_attributes = True