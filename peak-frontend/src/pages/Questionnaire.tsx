import { useEffect, useState } from "react";
import ProgressBar from "../components/questionnaire/ProgressBar";
import QuestionnaireSection from "../components/questionnaire/QuestionnaireSection";
import NextButton from "../components/questionnaire/NextButton";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Questionnaire() {
  //this area will store the answers to the questions
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Array<{ id: number; text: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api
      .get("/questionnaire/questions")
      .then((res) => {
        if (mounted) setQuestions(res.data || []);
      })
      .catch((err) => console.error("Failed to load questions", err));
    return () => {
      mounted = false;
    };
  }, []);

  // No auto-submit: users will answer manually

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  //keep track of how many questions have been answered
  const answeredCount = questions.filter(
    (q) => (answers[q.id] ?? "").length > 0
  ).length;

  const handleSubmit = async () => {
    try {
      await api.post("/questionnaire/answers", { answers });
      navigate('/profile');
    } catch (err) {
      console.error('Failed to submit answers', err);
      alert('Failed to submit questionnaire.');
    }
  };

  return (
    <div className="space-y-8 pt-24">
      <h1 className="text-3xl font-bold text-center">Questionnaire</h1>
      
      <ProgressBar
        currentStep={answeredCount}
        totalSteps={questions.length}
      />
      <QuestionnaireSection
        topic="Training Preferences"
        questions={questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
      />

      <NextButton isLastStep={true} onClick={handleSubmit} />
    </div>
  );
}
