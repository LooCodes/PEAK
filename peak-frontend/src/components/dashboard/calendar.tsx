import { useMemo } from "react";

type CalendarProps = {
  // e.g. ["2025-11-01", "2025-11-03"]
  markedDates?: string[]; 
};

function Calendar({ markedDates = [] }: CalendarProps) {
  const today = new Date();

  // Get year + month (0-based month!)
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 10 = Nov, etc.

  // Build calendar data
  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0); // day 0 of next month = last day of current

    const numDays = lastDayOfMonth.getDate();
    const startWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...

    const cells: (number | null)[] = [];

    // Empty cells before month starts
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }

    // Days of the month
    for (let day = 1; day <= numDays; day++) {
      cells.push(day);
    }

    return cells;
  }, [year, month]);

  const monthName = today.toLocaleString("default", { month: "long" });

  // Helper to format YYYY-MM-DD
  const formatDate = (day: number) => {
    const m = month + 1; // human month
    const mm = m < 10 ? `0${m}` : `${m}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    return `${year}-${mm}-${dd}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">
        {monthName} {year}
        </h2>

        {/* Grid container */}
        <div className="grid grid-cols-7 gap-1">

        {/* Weekday labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
            key={day}
            className="text-center font-semibold text-sm py-1"
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
                className="h-12 bg-gray-100 border border-gray-200 rounded"
                />
            );
            }

            const dateKey = formatDate(day);
            const isMarked = markedDates.includes(dateKey);

            return (
            <div
                key={index}
                className={`
                h-12 border border-gray-300 rounded flex flex-col items-center justify-center relative
                ${isMarked ? "bg-green-100 border-green-400" : ""}
                `}
            >
                <span className="text-sm font-medium">{day}</span>

                {isMarked && (
                <span className="w-2 h-2 bg-green-500 rounded-full absolute bottom-1"></span>
                )}
            </div>
            );
        })}
        </div>
    </div>
    );

}

export default Calendar;
