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
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-slate-600">
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold text-right">Points</th>
            <th className="px-4 py-3 font-semibold text-right">Streak (days)</th>
            <th className="px-4 py-3 font-semibold text-right">Change</th>
          </tr>
        </thead>
        <tbody>
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

            return (
              <tr
                key={entry.rank}
                className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isTop3
                        ? "bg-lime-100 text-lime-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium text-slate-800">{entry.name}</span>
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <span className="font-semibold text-slate-800">
                    {entry.points.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <span className="text-slate-700">{entry.streakDays}</span>
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <span className={`text-sm font-medium ${changeColor}`}>
                    {changeLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
