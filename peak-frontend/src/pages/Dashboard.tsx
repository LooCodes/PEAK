import { useEffect, useState } from "react";

import Calendar from "../components/dashboard/calendar";
import ViewLeaderBoard from "../components/dashboard/leaderboard";
import ViewChallenges from "../components/dashboard/challenges";
import WorkoutMeal from "../components/dashboard/workout-meals";

type CalendarApiResponse = {
  mealDates: string[];
  workoutDates: string[];
  meals: any[];     // we can type these properly later
  workouts: any[];
};

export default function Dashboard() {
  const [calendarData, setCalendarData] = useState<CalendarApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch("http://localhost:8000/dashboard/"); 
        // 🔺 if you mount the router with a prefix like "/dashboard",
        // change this to "http://localhost:8000/dashboard/calendar"
        
        if (!res.ok) {
          throw new Error("Failed to load calendar data");
        }

        const data: CalendarApiResponse = await res.json();
        console.log(data);
        setCalendarData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Something went wrong loading your dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  const workoutDates = calendarData?.workoutDates ?? [];
  const mealDates = calendarData?.mealDates ?? [];

  return (

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {loading && <p>Loading your dashboard...</p>}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex gap-20">
            <Calendar
              workoutDates={workoutDates}
              mealDates={mealDates}
              meals={calendarData?.meals ?? []}
              workouts={calendarData?.workouts ?? []}
            />
            <div className="flex flex-col gap-30">

              <ViewLeaderBoard />
              <ViewChallenges />
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <WorkoutMeal />
          </div>
        </>
      )}
    </div>
  );
}
