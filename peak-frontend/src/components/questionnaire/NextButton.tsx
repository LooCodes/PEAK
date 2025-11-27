type NextButtonProps = {
    isLastStep?: boolean;
    onClick: () => void;
  };
  //this is currently useless
export default function NextButton({ isLastStep, onClick }: NextButtonProps) {
    return (
        <div className="mt-6 flex justify-center pb-4">
        <button
            type="button"
            onClick={onClick}
            className="w-full max-w-md py-3 rounded-full bg-blue-500 hover:bg-blue-600 font-semibold text-lg tracking-wide transition-colors shadow-sm"
        >
            {isLastStep ? "Complete" : "Next"}
        </button>
        </div>
    );
}