type WorkoutMealProps = {
  onStartWorkout: () => void;
};

export default function WorkoutMeal({ onStartWorkout }: WorkoutMealProps) {
  return (
    <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <div className="flex items-center justify-between gap-4">

        {/* Start Workout */}
        <button
          onClick={onStartWorkout}
          className="flex-1 border border-gray-400 rounded-lg px-6 py-3 text-center
                     text-lg font-medium hover:bg-[#101010] transition"
        >
          + Start a Workout
        </button>

        {/* Track Meals */}
        <a
          href="/meal-logger"
          className="flex-1 border border-gray-400 rounded-lg px-6 py-3 text-center
                     text-lg font-medium hover:bg-[#101010] transition"
        >
          + Track your Meals
        </a>

      </div>
    </div>
  );
}
