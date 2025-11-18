import { useState } from "react";
import ProgressBar from "../components/dashboard/questionnaire/progressBar";
import QuestionnaireSection from "../components/dashboard/questionnaire/questionnaireSection";
import NextButton from "../components/dashboard/questionnaire/nextButton";

type Question = {
  id: number;
  text: string;
};

//questions to be displayed
const questions: Question[] = [
  { id: 1, text: "I want to use freeweights." },
  { id: 2, text: "I want to become leaner." },
  { id: 3, text: "I want to gain weight." },
  { id: 4, text: "I exercise often." },
  { id: 5, text: "I have experience with gym equipment." },
];

export default function QuestionnairePage() {
  //this area will store the answers to the questions
  const [answers, setAnswers] = useState<Record<number, string>>({});

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

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Questionnaire</h1>
        <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center">
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-slate-500" />
            <span className="block h-0.5 w-4 bg-slate-500" />
          </div>
        </div>
      </header>
      
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

      <NextButton
        isLastStep={false}
        onClick={() => {
          console.log("Next clicked (placeholder)");
        }}
      />
    </div>
  );
}
