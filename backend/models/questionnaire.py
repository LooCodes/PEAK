from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base import Base


class QuestionnaireQuestion(Base):
    __tablename__ = "questionnaire_questions"

    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    answers = relationship("UserQuestionnaireAnswer", back_populates="question", cascade="all, delete-orphan")


class UserQuestionnaireAnswer(Base):
    __tablename__ = "user_questionnaire_answers"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questionnaire_questions.id"), nullable=False, index=True)
    answer_value = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="questionnaire_answers")
    question = relationship("QuestionnaireQuestion", back_populates="answers")
