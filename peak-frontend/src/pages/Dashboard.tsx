import Calendar from "../components/dashboard/calendar";
import ViewLeaderBoard from "../components/dashboard/leaderboard";
import ViewChallenges from "../components/dashboard/challenges";
import WorkoutMeal from "../components/dashboard/workout-meals";

export default function Dashboard() {
  // later you'll pass real markedDates from backend
  const loggedWorkouts = [
  { date: "2025-11-02"},
  { date: "2025-11-14"}
  ];

  const loggedMeals = [
    { date: "2025-11-01" },
    { date: "2025-11-05" },
    { date: "2025-11-14"}
  ];

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="flex gap-20">
          <Calendar
            workoutDates={loggedWorkouts.map(w => w.date)}
            mealDates={loggedMeals.map(m => m.date)}
          />
          <div className="flex flex-col gap-30">
              <ViewLeaderBoard />
              <ViewChallenges />
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <WorkoutMeal />
        </div>
    </div>
  );
}