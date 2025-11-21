
export default function WorkoutMeal () {
    
    return (
        <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
            <div className="flex items-center justify-between gap-4">

                {/* Start Workout */}
                <a
                href="/workout-logger"
                className="flex-1 border border-gray-400 rounded-lg px-6 py-3 text-center 
                            text-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                + Start a Workout
                </a>

                {/* Track Meals */}
                <a
                href="/meal-logger"
                className="flex-1 border border-gray-400 rounded-lg px-6 py-3 text-center 
                            text-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                + Track your Meals
                </a>

            </div>
        </div>


    )
}