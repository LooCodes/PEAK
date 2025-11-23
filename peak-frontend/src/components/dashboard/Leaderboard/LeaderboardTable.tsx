// src/components/dashboard/leaderboard/LeaderboardTable.tsx

export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  streakDays: number;
  change: number; // positive = up, negative = down, 0 = same
};

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) return null;

  const maxPoints =
    entries.reduce((max, e) => (e.points > max ? e.points : max), 0) || 1;

  return (
    <div className="mt-6 space-y-3">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const changeColor =
          entry.change > 0
            ? "text-emerald-600"
            : entry.change < 0
            ? "text-rose-600"
            : "text-slate-500";

        const changeLabel =
          entry.change > 0
            ? `+${entry.change}`
            : entry.change < 0
            ? `${entry.change}`
            : "—";

        const barPercent = (entry.points / maxPoints) * 100;

        return (
          <div
            key={entry.rank}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            {/* top row: rank + name + change */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isTop3
                      ? "bg-lime-100 text-lime-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {entry.rank}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">
                    Streak: {entry.streakDays} day
                    {entry.streakDays === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">Change</p>
                <p className={`text-sm font-medium ${changeColor}`}>
                  {changeLabel}
                </p>
              </div>
            </div>

            {/* bar row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-400 transition-[width] duration-300"
                  style={{ width: `${barPercent}%` }}
                />
              </div>
              <div className="w-20 text-right">
                <p className="text-xs text-slate-500">Points</p>
                <p className="text-sm font-semibold text-slate-900">
                  {entry.points.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
