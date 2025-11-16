import Calendar from "../components/dashboard/calendar";

export default function Dashboard() {
  // later you'll pass real markedDates from backend
  const loggedDates = ["2025-11-01", "2025-11-03"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Calendar markedDates={loggedDates} />
    </div>
  );
}