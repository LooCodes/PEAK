type ProgressBarProps = {
    currentStep: number;
    totalSteps: number;
  };
  
export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

    return (
        <div className="w-full px-8">
        <div className="h-2 w-full rounded-full bg-[#101010] overflow-hidden">
            <div
            className="h-full bg-blue-500 rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%` }}
            />
        </div>
        </div>
    );
}