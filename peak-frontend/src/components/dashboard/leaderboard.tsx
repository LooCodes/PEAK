// src/components/dashboard/leaderboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type MeSummary = {
  rank: number;
  weekly_xp: number;
};

type ViewLeaderBoardProps = {
  /** When this changes, we re-fetch the summary */
  refreshKey?: number;
};

export default function ViewLeaderBoard({ refreshKey = 0 }: ViewLeaderBoardProps) {
  const { token } = useAuth();

  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/leaderboard/me/summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to load leaderboard summary (${res.status})`);
        }

        const data = (await res.json()) as MeSummary;
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Could not load leaderboard summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token, refreshKey]); // 👈 this is the important part!

  if (!token) {
    return (
      <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
        <p className="text-sm text-gray-400">Log in to see your ranking.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
        <p className="text-sm text-gray-400">Loading your ranking...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
        <p className="text-sm text-red-500">{error ?? "No data yet."}</p>
      </div>
    );
  }

  const { rank, weekly_xp } = summary;

  return (
    <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <div className="flex gap-30">
        <div className="flex items-center text-4xl font-bold">
          <h2>{rank}</h2>
        </div>
        <div className="inline-block">
          <Link to="/leaderboard" className="font-extrabold hover:underline">
            View Leaderboard
          </Link>

          <h2>You're ranked #{rank}</h2>
          <h2 className="font-light">You have earned {weekly_xp} XP this week.</h2>
        </div>
      </div>
    </div>
  );
}
