import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type Challenge = {
  id: number;
  label: string;
  progress: number; // 0–100
};

type ChallengesResponse = {
  daily: Challenge[];
  weekly: Challenge[];
};

export default function ViewChallenges() {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // if your app doesn’t use a token, you can delete useAuth + Authorization header
  const { token } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/challenges`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include", // keep if you use cookies for auth
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data: ChallengesResponse = await res.json();
        setDailyChallenges(data.daily || []);
        setWeeklyChallenges(data.weekly || []);
      } catch (err) {
        console.error(err);
        setError("Could not load challenges.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
        <h2 className="text-2xl font-bold mb-1">Your Challenges</h2>
        <p className="text-sm text-gray-500">Loading challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
        <h2 className="text-2xl font-bold mb-1">Your Challenges</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <h2 className="text-2xl font-bold mb-1">Your Challenges</h2>

      <div className="flex gap-8 px-2">
        {/* Daily */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 underline">Daily</h3>
          <ul className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <li key={challenge.id}>
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
            {dailyChallenges.length === 0 && (
              <li className="text-sm text-gray-500">
                No daily challenges yet.
              </li>
            )}
          </ul>
        </div>

        {/* Weekly */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 underline">Weekly</h3>
          <ul className="space-y-3">
            {weeklyChallenges.map((challenge) => (
              <li key={challenge.id}>
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
            {weeklyChallenges.length === 0 && (
              <li className="text-sm text-gray-500">
                No weekly challenges yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
