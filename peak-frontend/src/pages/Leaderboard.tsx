// src/pages/Leaderboard.tsx

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
};

const ENTRIES: LeaderboardEntry[] = [
  { rank: 1, name: "Sam", points: 3200 },
  { rank: 2, name: "Arjun", points: 2950 },
  { rank: 3, name: "Luis", points: 2810 },
  { rank: 4, name: "bigjony24K", points: 2500 }, // 👈 uppercase K
  { rank: 5, name: "2", points: 2300 },
  { rank: 6, name: "3", points: 2200 },
  { rank: 7, name: "4th guy", points: 2100 },
];

const CURRENT_USER_NAME = "bigjony24K";

export default function LeaderboardPage() {
  const sorted = [...ENTRIES].sort((a, b) => a.rank - b.rank);
  const [first, second, third] = sorted;
  const others = sorted.slice(3);

  const yourEntry =
    sorted.find((e) => e.name === CURRENT_USER_NAME) ?? sorted[0];

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

      {/* Subtitle: date range */}
      <p className="text-center text-sm text-slate-600">
        PEAK Ranking for 11/09/2025 – 11/16/2025
        {/* later you can compute this week’s range */}
      </p>

      {/* Podium for top 3 */}
      {first && second && third && (
        <section className="mt-4 flex justify-center items-end gap-6">
          {/* 2nd place (left) */}
          <PodiumBlock
            position="2nd"
            entry={second}
            heightClass="h-28"
          />

          {/* 1st place (center, tallest) */}
          <PodiumBlock
            position="1st"
            entry={first}
            heightClass="h-36"
            highlight
          />

          {/* 3rd place (right) */}
          <PodiumBlock
            position="3rd"
            entry={third}
            heightClass="h-24"
          />
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
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {entry.points.toLocaleString()} pts
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
              {CURRENT_USER_NAME}
            </p>
            <p className="text-xs text-slate-500">
              {yourEntry.points.toLocaleString()} total points
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────── */
/* Small helper component for the podium blocks    */
/* ──────────────────────────────────────────────── */

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
        {entry.name}
      </span>
      <div
        className={`w-24 ${heightClass} rounded-t-2xl border border-slate-300 bg-white flex flex-col items-center justify-center shadow-sm ${
          highlight ? "bg-lime-100 border-lime-300" : ""
        }`}
      >
        <span className="text-lg font-bold text-slate-900">
          {position}
        </span>
        <span className="text-[11px] text-slate-500 mt-1">
          {entry.points.toLocaleString()} pts
        </span>
      </div>
    </div>
  );
}
