import { useMemo, useState } from "react";

type CalendarProps = {
  workoutDates?: string[];
  mealDates?: string[];
};

function Calendar({ workoutDates = [], mealDates = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

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

    // ✅ Always render 6 rows (6 * 7 = 42 cells) for fixed height
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

  // 🔹 Compute "today" in LOCAL time (not UTC)
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1–12
  const todayDay = today.getDate();
  const todayKey = `${todayYear}-${String(todayMonth).padStart(2, "0")}-${String(
    todayDay
  ).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-md bg-white p-6 border border-gray-300 rounded-xl shadow">
      {/* Header with month + arrows */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="px-2 py-1 text-lg font-semibold hover:bg-gray-100 rounded"
        >
          ‹
        </button>

        <h2 className="text-xl font-bold">
          {monthName} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          className="px-2 py-1 text-lg font-semibold hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-1">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={index}
                className="h-14 bg-gray-100 border border-gray-200 rounded"
              />
            );
          }

          const dateKey = formatDate(day);

          const hasWorkout = workoutDates.includes(dateKey);
          const hasMeal = mealDates.includes(dateKey);
          const isToday = dateKey === todayKey;
          const isInteractive = hasWorkout || hasMeal;

          return (
            <div
              key={index}
              className={`
                relative h-14 border rounded flex flex-col items-center justify-start pt-1
                ${isToday ? "bg-green-100 border-green-500" : "border-gray-300"}
                ${
                  isInteractive
                    ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:shadow-md hover:scale-105 transition-transform transition-colors duration-150"
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
  );
}

export default Calendar;
