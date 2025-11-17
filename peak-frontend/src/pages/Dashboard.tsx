import Calendar from "../components/dashboard/calendar";
import ViewLeaderBoard from "../components/dashboard/leaderboard";
import ViewChallenges from "../components/dashboard/challenges";

export default function Dashboard() {
  // later you'll pass real markedDates from backend
  const loggedDates = ["2025-11-01", "2025-11-03"];

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="flex gap-20">
            <Calendar markedDates={loggedDates} />
            <div className="flex flex-col gap-16">
                <ViewLeaderBoard />
                <ViewChallenges />
            </div>
        </div>
    </div>
  );
}