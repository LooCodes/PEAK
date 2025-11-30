import { useEffect, useState } from "react";
import ProgressBar from "../components/questionnaire/ProgressBar";
import QuestionnaireSection from "../components/questionnaire/QuestionnaireSection";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Questionnaire() {
  //this area will store the answers to the questions
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Array<{ id: number; text: string }>>([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 5;

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
        questions={questions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)}
        answers={answers}
        onAnswerChange={handleAnswerChange}
      />

      <div className="flex items-center justify-center gap-4">
        <button
          className={`px-3 py-2 rounded ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-[#111111] hover:bg-[#222]'} text-sm`}
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </button>

        {/* page numbers */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.max(1, Math.ceil(questions.length / PAGE_SIZE)) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`px-3 py-1 rounded ${idx === currentPage ? 'bg-blue-600 text-white' : 'bg-[#111111] text-sm'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          className={`px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-sm`}
          onClick={() => {
            const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
            if (currentPage >= totalPages - 1) {
              handleSubmit();
            } else {
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
            }
          }}
        >
          {currentPage >= Math.max(1, Math.ceil(questions.length / PAGE_SIZE)) - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
