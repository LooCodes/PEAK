type NextButtonProps = {
    isLastStep?: boolean;
    onClick: () => void;
  };
  //this is currently useless
export default function NextButton({ isLastStep, onClick }: NextButtonProps) {
    return (
        <div className="mt-6 flex justify-center">
        <button
            type="button"
            onClick={onClick}
            className="w-full max-w-md py-3 rounded-full bg-lime-400 text-black font-semibold text-lg tracking-wide hover:bg-lime-300 transition-colors shadow-sm"
        >
            {isLastStep ? "Complete" : "Next"}
        </button>
        </div>
    );
}