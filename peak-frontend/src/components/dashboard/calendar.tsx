import { useMemo, useState } from "react";

type FoodItem = {
  foodName: string;
  qtyGrams: number | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  allergens?: string | null;
};

type Meal = {
  id: number;
  eatenAt: string | null; // ISO string from backend
  createdAt?: string | null;
  items: FoodItem[];
};

type WorkoutSet = {
  id: number;
  setNo: number;
  reps: number;
  weight: number | null;
  durationSeconds: number | null;
  calories: number | null;
  exercise: {
    id: number;
    name: string;
    type: string;
    muscleGroup: string;
  };
};

type Workout = {
  id: number;
  performedAt: string | null; // ISO string
  notes: string | null;
  sets: WorkoutSet[];
};

type CalendarProps = {
  workoutDates?: string[];
  mealDates?: string[];
  meals?: Meal[];
  workouts?: Workout[];
};

/**
 * Turn an ISO string into a local date key "YYYY-MM-DD" in the user's timezone.
 */
function isoToLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 0-based
  const day = d.getDate();

  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${mm}-${dd}`;
}

/**
 * Format duration in seconds into a human-friendly string without rounding:
 * - < 60  → "XX sec"
 * - >= 60 → "X min", "X min Y sec"
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (remaining === 0) {
    return `${mins} min`;
  }
  return `${mins} min ${remaining} sec`;
}

function Calendar({
  // workoutDates = [],
  // mealDates = [],
  meals = [],
  workouts = [],
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // state for popup
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const numDays = lastDayOfMonth.getDate();
    const startWeekday = firstDayOfMonth.getDay();

    const cells: (number | null)[] = [];

    // Empty cells before month starts
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }

    // Days of the month
    for (let day = 1; day <= numDays; day++) {
      cells.push(day);
    }

    // Always 6 rows = 42 cells
    while (cells.length < 42) {
      cells.push(null);
    }

    return cells;
  }, [year, month]);

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const formatDate = (day: number) => {
    const m = month + 1;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    return `${year}-${mm}-${dd}`;
  };

  const goToPrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // today in local time
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const todayKey = `${todayYear}-${String(todayMonth).padStart(
    2,
    "0"
  )}-${String(todayDay).padStart(2, "0")}`;

  // Derive local date keys from the actual ISO timestamps
  const workoutDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of workouts) {
      if (w.performedAt) {
        set.add(isoToLocalDateKey(w.performedAt));
      }
    }
    return set;
  }, [workouts]);

  const mealDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const m of meals) {
      if (m.eatenAt) {
        set.add(isoToLocalDateKey(m.eatenAt));
      }
    }
    return set;
  }, [meals]);

  // when user clicks on a day cell
  const handleDayClick = (dateKey: string, isInteractive: boolean) => {
    if (!isInteractive) return;

    const mealsForDay = meals.filter(
      (m) => m.eatenAt && isoToLocalDateKey(m.eatenAt) === dateKey
    );
    const workoutsForDay = workouts.filter(
      (w) => w.performedAt && isoToLocalDateKey(w.performedAt) === dateKey
    );

    setSelectedDate(dateKey);
    setSelectedMeals(mealsForDay);
    setSelectedWorkouts(workoutsForDay);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedMeals([]);
    setSelectedWorkouts([]);
  };

  const prettyDate = (isoDate: string | null) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="w-full max-w-md bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow relative">
        {/* Header with month + arrows */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="px-2 py-1 text-lg font-semibold hover:bg-[#101010] rounded"
          >
            ‹
          </button>

          <h2 className="text-xl font-bold">
            {monthName} {year}
          </h2>

          <button
            onClick={goToNextMonth}
            className="px-2 py-1 text-lg font-semibold hover:bg-[#101010] rounded"
          >
            ›
          </button>
        </div>

        {/* Grid container */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday labels */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm py-1 text-gray-200"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={index}
                  className="h-14 bg-[#212121] border border-gray-700 rounded"
                />
              );
            }

            const dateKey = formatDate(day);

            const hasWorkout = workoutDateSet.has(dateKey);
            const hasMeal = mealDateSet.has(dateKey);
            const isToday = dateKey === todayKey;
            const isInteractive = hasWorkout || hasMeal;

            return (
              <div
                key={index}
                onClick={() => handleDayClick(dateKey, isInteractive)}
                className={`
                  relative h-14 border rounded flex flex-col items-center justify-start pt-1
                  ${
                    isToday
                      ? "bg-[#062e03] border-green-500"
                      : "bg-[#212121] border-gray-700"
                  }
                  ${
                    isInteractive
                      ? "cursor-pointer hover:bg-[#101010] hover:border-blue-400 hover:shadow-md hover:scale-105 transition-transform transition-colors duration-150"
                      : ""
                  }
                `}
              >
                {/* Day number */}
                <span className="text-sm font-medium">{day}</span>

                {/* Emoji row */}
                <div className="flex gap-1 mt-1 text-lg leading-none">
                  {hasWorkout && <span>🏋️</span>}
                  {hasMeal && <span>🍎</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup modal for selected day */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111111] text-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Activity for{" "}
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* Workouts */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                🏋️ Workouts
                <span className="text-sm text-gray-400">
                  ({selectedWorkouts.length})
                </span>
              </h4>
              {selectedWorkouts.length === 0 ? (
                <p className="text-sm text-gray-400">No workouts logged.</p>
              ) : (
                <div className="space-y-3">
                  {selectedWorkouts.map((w) => (
                    <div
                      key={w.id}
                      className="border border-gray-700 rounded-lg p-3 bg-[#181818]"
                    >
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>{prettyDate(w.performedAt)}</span>
                        {w.notes && (
                          <span className="italic text-gray-400">
                            {w.notes}
                          </span>
                        )}
                      </div>
                      <ul className="text-sm space-y-1">
                        {w.sets.map((s) => (
                          <li key={s.id}>
                            <span className="font-semibold">
                              {s.exercise.name}
                            </span>{" "}
                            — set {s.setNo}: {s.reps} reps
                            {s.weight !== null && <> @ {s.weight} kg</>}
                            {s.durationSeconds !== null && (
                              <> • {formatDuration(s.durationSeconds)}</>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meals */}
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                🍎 Meals
                <span className="text-sm text-gray-400">
                  ({selectedMeals.length})
                </span>
              </h4>
              {selectedMeals.length === 0 ? (
                <p className="text-sm text-gray-400">No meals logged.</p>
              ) : (
                <div className="space-y-3">
                  {selectedMeals.map((m) => (
                    <div
                      key={m.id}
                      className="border border-gray-700 rounded-lg p-3 bg-[#181818]"
                    >
                      <div className="text-sm text-gray-300 mb-1">
                        {prettyDate(m.eatenAt)}
                      </div>
                      <ul className="text-sm space-y-1">
                        {m.items.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-semibold">
                              {item.foodName}
                            </span>{" "}
                            {item.qtyGrams !== null && (
                              <span className="text-gray-300">
                                — {item.qtyGrams} g
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Calendar;
