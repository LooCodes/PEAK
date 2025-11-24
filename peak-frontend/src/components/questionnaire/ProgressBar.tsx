type ProgressBarProps = {
    currentStep: number;
    totalSteps: number;
  };
  
export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

    return (
        <div className="w-full">
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
            className="h-full bg-lime-400 rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%` }}
            />
        </div>
        </div>
    );
}