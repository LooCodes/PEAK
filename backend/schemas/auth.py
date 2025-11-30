from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    height: Optional[int] = Field(None, ge=0)
    weight: Optional[int] = Field(None, ge=0)


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    age: Optional[int] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    streak: int = 0
    total_xp: int = 0
    first_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
