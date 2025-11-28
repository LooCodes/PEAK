from pydantic import BaseModel

class LeaderboardItem(BaseModel):
    username: str
    weekly_points: int
    rank: int