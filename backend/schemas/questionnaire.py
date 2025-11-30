from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime


class QuestionItem(BaseModel):
    id: int
    text: str
    sort_order: int

    class Config:
        from_attributes = True


class SubmitAnswers(BaseModel):
    answers: Dict[int, str]


class LatestAnswerItem(BaseModel):
    question_id: int
    question_text: str
    answer_value: str
    updated_at: datetime

    class Config:
        from_attributes = True


class LatestResponse(BaseModel):
    items: List[LatestAnswerItem]
