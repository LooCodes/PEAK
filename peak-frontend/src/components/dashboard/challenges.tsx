type Challenge = {
  label: string;
  progress: number; // 0–100
};

export default function ViewChallenges() {
  const daily_challenges: Challenge[] = [
    { label: "Do 5 push-ups", progress: 60 },
    { label: "Drink 2L of water", progress: 40 },
    { label: "Walk 5,000 steps", progress: 80 },
  ];

  const weekly_challenges: Challenge[] = [
    { label: "Do 100 push-ups", progress: 25 },
    { label: "Run 10 miles total", progress: 50 },
    { label: "Hit the gym 3 times", progress: 10 },
  ];

  return (
    <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <h2 className="text-2xl font-bold mb-1">Your Challenges</h2>

      <div className="flex gap-8 px-2">
        {/* Daily */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 underline">Daily</h3>
          <ul className="space-y-3">
            {daily_challenges.map((challenge, index) => (
              <li key={index}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{challenge.label}</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Weekly */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 underline">Weekly</h3>
          <ul className="space-y-3">
            {weekly_challenges.map((challenge, index) => (
              <li key={index}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{challenge.label}</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
