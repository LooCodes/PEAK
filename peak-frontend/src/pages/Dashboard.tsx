import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Calendar from "../components/dashboard/calendar";
import ViewLeaderBoard from "../components/dashboard/leaderboard";
import ViewChallenges from "../components/dashboard/challenges";
import WorkoutMeal from "../components/dashboard/workout-meals";
import { useAuth } from "../context/AuthContext";
import StartWorkoutModal from "../components/workouts/StartWorkoutModal";
import MealLoggerModal from "../components/meal-logger/MealLoggerModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type CalendarApiResponse = {
  mealDates: string[];
  workoutDates: string[];
  meals: any[];
  workouts: any[];
};

type CompleteResponse = {
  completed: boolean;
  weekly_xp?: number;
  total_xp?: number;
};

export default function Dashboard() {
  const { token } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMealLoggerModal, setShowMealLoggerModal] = useState(false);
  const [hasTodayMealLog, setHasTodayMealLog] = useState<boolean | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/dashboard/`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to load calendar data (${res.status})`);
        }

        const data: CalendarApiResponse = await res.json();
        console.log("calendar data", data);
        setCalendarData(data);
      } catch (err: any) {
        console.error(err);
        setError(
          err.message ?? "Something went wrong loading your dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCalendar();
    } else {
      setLoading(false);
      setError("You must be logged in to view your dashboard.");
    }
  }, [token, calendarRefreshKey]);

  useEffect(() => {
    const checkTodayMeal = async () => {
      if (!token) {
        setHasTodayMealLog(null);
        return;
      }

      try {
        const res = await api.get("/meal-logger/today");
        if (res.data && res.data.meal) {
          setHasTodayMealLog(true);
        } else {
          setHasTodayMealLog(false);
        }
      } catch (err: any) {
        console.error("Error checking today's meal log:", err);
      }
    };

    checkTodayMeal();
  }, [token, calendarRefreshKey]);

  useEffect(() => {
    const shouldOpenLogger = searchParams.get("openMealLogger") === "1";
    if (shouldOpenLogger) {
      setShowMealLoggerModal(true);
      setCalendarRefreshKey((prev) => prev + 1);

      const next = new URLSearchParams(searchParams);
      next.delete("openMealLogger");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const workoutDates = calendarData?.workoutDates ?? [];
  const mealDates = calendarData?.mealDates ?? [];

  const handleChallengeCompleted = (
    _payload: CompleteResponse,
    _challengeId: number
  ) => {
    setLeaderboardRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen pt-24 px-6 flex justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

        {loading && <p>Loading your dashboard...</p>}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {!loading && !error && calendarData && (
          <>
            <div className="flex gap-20">
              <Calendar
                workoutDates={workoutDates}
                mealDates={mealDates}
                meals={calendarData.meals}
                workouts={calendarData.workouts}
              />

              <div className="flex flex-col gap-30">
                <ViewLeaderBoard refreshKey={leaderboardRefreshKey} />
                <ViewChallenges
                  onChallengeCompleted={handleChallengeCompleted}
                />
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <WorkoutMeal
                onStartWorkout={() => setShowWorkoutModal(true)}
                onOpenMealLogger={() => setShowMealLoggerModal(true)}
                hasTodayMealLog={hasTodayMealLog}
              />
            </div>
          </>
        )}

        {showWorkoutModal && (
          <StartWorkoutModal
            isOpen={showWorkoutModal}
            onClose={() => setShowWorkoutModal(false)}
            onWorkoutSaved={() =>
              setCalendarRefreshKey((prev) => prev + 1)
            }
          />
        )}

        {showMealLoggerModal && (
          <MealLoggerModal
            isOpen={showMealLoggerModal}
            onClose={() => setShowMealLoggerModal(false)}
            onMealSaved={() =>
              setCalendarRefreshKey((prev) => prev + 1)
            }
          />
        )}
      </div>
    </div>
  );
}
