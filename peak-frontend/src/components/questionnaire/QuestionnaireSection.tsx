type Question = {
    id: number;
    text: string;
  };
  
  type QuestionnaireSectionProps = {
    topic: string;
    questions: Question[];
    answers: Record<number, string>;
    onAnswerChange: (id: number, value: string) => void;
  };
  
  const LIKERT_OPTIONS = [
    "Strongly disagree",
    "Disagree",
    "Neither agree nor disagree",
    "Agree",
    "Strongly agree",
  ];
  
  export default function QuestionnaireSection({
    topic,
    questions,
    answers,
    onAnswerChange,
  }: QuestionnaireSectionProps) {
    return (
      <section className="space-y-6 px-16">
        <h2 className="text-2xl font-semibold text-center">{topic}</h2>
  
        <div className="space-y-5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-[#1a1a1a] px-6 py-5 shadow-sm"
            >
              <p className="font-medium text-lg mb-4">
                 {q.text}
              </p>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <span className="text-sm mb-1 md:mb-0">
                  Select one:
                </span>
  
                <div className="flex flex-wrap gap-2">
                  {LIKERT_OPTIONS.map((option) => {
                    const selected = answers[q.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onAnswerChange(q.id, option)}
                        className={[
                          "px-3 py-1 rounded-full border text-xs md:text-sm transition-colors",
                          selected
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-[#212121] hover:bg-[#101010]",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  