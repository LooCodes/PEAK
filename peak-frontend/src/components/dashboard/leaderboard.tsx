// src/components/dashboard/leaderboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type LeaderboardMe = { //fix
  username: string;
  weekly_points: number;
  rank: number;
};

export default function DashboardLeaderboardCard() {
  const { token } = useAuth();
  const [data, setData] = useState<LeaderboardMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leaderboard/me`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const body: LeaderboardMe = await res.json();
        setData(body);
      } catch (err) {
        console.error(err);
        setError("Could not load leaderboard info.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  return (
    <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <h2 className="text-2xl font-bold mb-1">View Leaderboard</h2>

      {loading && (
        <p className="text-sm text-gray-500">Loading your rank...</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && data && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-5xl font-bold text-gray-800">
            {data.rank}
          </div>
          <div className="ml-6">
            <p className="font-semibold text-lg">
              You&apos;re ranked #{data.rank}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You&apos;ve earned{" "}
              <span className="font-semibold">{data.weekly_points} XP</span>{" "}
              this week.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <p className="text-sm text-gray-500 mt-2">
          No leaderboard data found for this account yet.
        </p>
      )}
    </div>
  );
}
