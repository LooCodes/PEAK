from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models.questionnaire import QuestionnaireQuestion, UserQuestionnaireAnswer
from models.user import User
from schemas.questionnaire import QuestionItem, SubmitAnswers, LatestAnswerItem
from auth import get_current_user


router = APIRouter(prefix="/api/questionnaire", tags=["questionnaire"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/questions", response_model=list[QuestionItem])
def get_questions(db: Session = Depends(get_db)):
    qs = db.query(QuestionnaireQuestion).order_by(QuestionnaireQuestion.sort_order.asc()).all()
    return qs


@router.post("/answers", status_code=status.HTTP_201_CREATED)
def submit_answers(data: SubmitAnswers, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Upsert each answer for the user
    for qid_str, value in data.answers.items():
        # keys may arrive as strings from JSON; ensure int
        try:
            qid = int(qid_str)
        except Exception:
            qid = qid_str

        existing = (
            db.query(UserQuestionnaireAnswer)
            .filter(UserQuestionnaireAnswer.user_id == current_user.id)
            .filter(UserQuestionnaireAnswer.question_id == qid)
            .first()
        )
        if existing:
            existing.answer_value = value
        else:
            new = UserQuestionnaireAnswer(user_id=current_user.id, question_id=qid, answer_value=value)
            db.add(new)
    db.commit()
    return {"message": "saved"}


@router.get("/latest", response_model=list[LatestAnswerItem])
def get_latest(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch latest answers for this user, ordered by question and timestamp
    answers = (
        db.query(UserQuestionnaireAnswer)
        .filter(UserQuestionnaireAnswer.user_id == current_user.id)
        .order_by(UserQuestionnaireAnswer.question_id.asc(), UserQuestionnaireAnswer.updated_at.desc())
        .all()
    )

    seen = {}
    for a in answers:
        if a.question_id not in seen:
            seen[a.question_id] = a

    results = []
    for qid, ans in seen.items():
        q = db.query(QuestionnaireQuestion).filter(QuestionnaireQuestion.id == qid).first()
        if q:
            results.append(LatestAnswerItem(question_id=q.id, question_text=q.text, answer_value=ans.answer_value, updated_at=ans.updated_at))

    # return in sort order of the questions
    results.sort(key=lambda r: r.question_id)
    return results


