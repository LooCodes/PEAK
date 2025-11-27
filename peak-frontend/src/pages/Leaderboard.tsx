// src/pages/Leaderboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type LeaderboardEntry = {
  rank: number;
  username: string;
  weekly_points: number;
};

type MeEntry = LeaderboardEntry;

export default function Leaderboard() {
  const { token } = useAuth();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<MeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // fetch weekly + me in parallel
        const [weeklyRes, meRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leaderboard/weekly`, {
            headers,
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/leaderboard/me`, {
            headers,
            credentials: "include",
          }),
        ]);

        if (!weeklyRes.ok) {
          throw new Error(`Weekly request failed: ${weeklyRes.status}`);
        }
        if (!meRes.ok) {
          throw new Error(`Me request failed: ${meRes.status}`);
        }

        const weeklyData: LeaderboardEntry[] = await weeklyRes.json();
        const meData: MeEntry = await meRes.json();

        setEntries(weeklyData);
        setMe(meData);
      } catch (err) {
        console.error(err);
        setError("Could not load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token]);

  const sorted: LeaderboardEntry[] = Array.isArray(entries)
    ? [...entries].sort((a, b) => a.rank - b.rank)
    : [];

  const [first, second, third] = sorted;
  const others = sorted.slice(3);

  // Find YOUR row (or default to rank 1 entry)
  const yourEntry = me ?? sorted[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!entries.length || !yourEntry) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">
          No leaderboard data yet. Log some activity to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top bar like your sketch */}
      <header className="flex items-center justify-between">
        {/* hamburger */}
        <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center">
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-slate-600" />
            <span className="block h-0.5 w-4 bg-slate-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>

        <div className="text-sm font-semibold tracking-wide text-slate-600">
          PEAK.
        </div>
      </header>

      {/* Subtitle: date range (still hardcoded for now) */}
      <p className="text-center text-sm text-slate-600">
        PEAK Ranking for this week
      </p>

      {/* Podium for top 3 */}
      {first && second && third && (
        <section className="mt-4 flex justify-center items-end gap-6">
          {/* 2nd place (left) */}
          <PodiumBlock position="2nd" entry={second} heightClass="h-28" />

          {/* 1st place (center, tallest) */}
          <PodiumBlock
            position="1st"
            entry={first}
            heightClass="h-36"
            highlight
          />

          {/* 3rd place (right) */}
          <PodiumBlock position="3rd" entry={third} heightClass="h-24" />
        </section>
      )}

      {/* Ranks 4+ */}
      <section className="space-y-3 mt-6">
        {others.map((entry) => (
          <div
            key={entry.rank}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-500">
                {entry.rank}.
              </span>
              <span className="font-medium text-slate-900">
                {entry.username}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {entry.weekly_points.toLocaleString()} pts
            </span>
          </div>
        ))}
      </section>

      {/* Your rank at the bottom */}
      <section className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Your ranking
            </p>
            <p className="text-2xl font-bold text-slate-900">
              #{yourEntry.rank}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {yourEntry.username}
            </p>
            <p className="text-xs text-slate-500">
              {yourEntry.weekly_points.toLocaleString()} weekly points
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type PodiumBlockProps = {
  position: "1st" | "2nd" | "3rd";
  entry: LeaderboardEntry;
  heightClass: string; // e.g. "h-36"
  highlight?: boolean;
};

function PodiumBlock({
  position,
  entry,
  heightClass,
  highlight,
}: PodiumBlockProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-slate-800">
        {entry.username}
      </span>
      <div
        className={`w-24 ${heightClass} rounded-t-2xl border border-slate-300 bg-white flex flex-col items-center justify-center shadow-sm ${
          highlight ? "bg-lime-100 border-lime-300" : ""
        }`}
      >
        <span className="text-lg font-bold text-slate-900">{position}</span>
        <span className="text-[11px] text-slate-500 mt-1">
          {entry.weekly_points.toLocaleString()} pts
        </span>
      </div>
    </div>
  );
}
