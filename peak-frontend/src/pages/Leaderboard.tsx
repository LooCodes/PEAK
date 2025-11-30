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
          fetch(`${API_BASE_URL}/leaderboard/weekly`, {
            headers,
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/leaderboard/me`, {
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
        <p className="text-sm ">Loading leaderboard...</p>
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
        <p className="text-sm">
          No leaderboard data yet. Log some activity to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-24">
      {/* Top bar like your sketch */}
        

        <h1 className="text-2xl font-bold text-center">Leaderboard</h1>

        
      {/* Subtitle: date range (still hardcoded for now) */}
      <p className="text-center text-sm">
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
            
          />

          {/* 3rd place (right) */}
          <PodiumBlock position="3rd" entry={third} heightClass="h-24" />
        </section>
      )}

      {/* Ranks 4+ (scrollable list so users can reach past rank 10) */}
      <section className="mt-6 px-24">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-3">
          {others.map((entry) => (
            <div
              key={entry.rank}
              className="rounded-2xl border border-slate-200 bg-[#1a1a1a] px-5 py-3 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">
                  {entry.rank}.
                </span>
                <span className="font-medium">
                  {entry.username}
                </span>
              </div>
              <span className="text-sm font-semibold">
                {entry.weekly_points.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Your rank at the bottom */}
      <section className="mt-6 px-16">
          <div className="rounded-2xl border border-slate-200 bg-[#1a1a1a] px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide">
                Your ranking
              </p>
              <p className="text-2xl font-bold">
                #{yourEntry.rank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {yourEntry.username}
              </p>
              <p className="text-xs">
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
    heightClass: string;
    highlight?: boolean;
    bgColor: string;
  };

const podiumColors = {
  "1st": "bg-[#d8b13d]",
  "2nd": "bg-[#a9b0b4]",
  "3rd": "bg-[#674019]",
};
  
  function PodiumBlock({
    position,
    entry,
    heightClass,
  }: PodiumBlockProps) {
    return (
      <div className="flex flex-col items-center gap-2 ">
        <span className="text-sm font-medium">
          {entry.username}
        </span>
        <div
          className={`w-24 ${heightClass} rounded-t-2xl border border-slate-300 flex flex-col items-center justify-center shadow-sm ${podiumColors[position]}`}
        >
          <span className="text-lg font-bold">
            {position}
          </span>
          <span className="text-[11px] mt-1">
            {entry.weekly_points.toLocaleString()} pts
          </span>
        </div>
      </div>
    );
  }