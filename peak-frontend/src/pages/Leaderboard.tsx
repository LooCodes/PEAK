// src/pages/Leaderboard.tsx
import { useEffect, useState } from "react";
import LeaderboardTable from "../components/dashboard/Leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "../components/dashboard/Leaderboard/LeaderboardTable";

type Period = "weekly" | "monthly" | "all-time";

const MOCK_DATA: Record<Period, LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, name: "You", points: 820, streakDays: 6, change: +1 },
    { rank: 2, name: "sam", points: 790, streakDays: 7, change: 0 },
    { rank: 3, name: "luis", points: 740, streakDays: 4, change: -1 },
    { rank: 4, name: "arjun", points: 690, streakDays: 3, change: +2 },
    { rank: 5, name: "fluff", points: 650, streakDays: 2, change: 0 },
  ],
  monthly: [
    { rank: 1, name: "sam", points: 3100, streakDays: 18, change: 0 },
    { rank: 2, name: "You", points: 2980, streakDays: 16, change: +2 },
    { rank: 3, name: "luis", points: 2750, streakDays: 12, change: -1 },
    { rank: 4, name: "arjun", points: 2600, streakDays: 10, change: 0 },
    { rank: 5, name: "fluff", points: 2450, streakDays: 7, change: +1 },
  ],
  "all-time": [
    { rank: 1, name: "sam", points: 10230, streakDays: 45, change: 0 },
    { rank: 2, name: "You", points: 9875, streakDays: 39, change: 0 },
    { rank: 3, name: "luis", points: 9540, streakDays: 34, change: 0 },
    { rank: 4, name: "arjun", points: 9230, streakDays: 29, change: 0 },
    { rank: 5, name: "fluff", points: 8870, streakDays: 21, change: 0 },
  ],
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // later: replace with real API call
  useEffect(() => {
    setEntries(MOCK_DATA[period]);
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track how you stack up against other PEAK users.
          </p>
        </div>

        {/* Period toggle */}
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {(["weekly", "monthly", "all-time"] as Period[]).map((p) => {
            const label =
              p === "weekly"
                ? "Weekly"
                : p === "monthly"
                ? "Monthly"
                : "All-time";
            const isActive = p === period;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-colors ${
                  isActive
                    ? "bg-lime-400 text-black"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Highlight card for "You" */}
      {entries.length > 0 && (
        <div className="rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-lime-900">
              Your position this {period === "weekly" ? "week" : period === "monthly" ? "month" : "season"}
            </p>
            <p className="text-sm text-lime-800">
              Keep hitting your workouts and logging food to climb higher!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-lime-800">
                Rank
              </p>
              <p className="text-2xl font-bold text-lime-900">
                {
                  entries.find((e) => e.name === "You")?.rank ??
                  "–"
                }
              </p>
            </div>
            <div className="w-px h-10 bg-lime-200" />
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-lime-800">
                Points
              </p>
              <p className="text-2xl font-bold text-lime-900">
                {entries
                  .find((e) => e.name === "You")
                  ?.points.toLocaleString() ?? "–"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <LeaderboardTable entries={entries} />
    </div>
  );
}
