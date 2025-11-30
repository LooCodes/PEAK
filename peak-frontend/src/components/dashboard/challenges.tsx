// src/components/dashboard/challenges.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type Challenge = {
  id: number;
  type: string;
  title: string | null;
  description: string | null;
  points: number;
};

type UserChallenge = {
  challenge_id: number;
  completed_at: string | null;
};

type CompleteResponse = {
  completed: boolean;
  weekly_xp?: number;
  total_xp?: number;
};

type ViewChallengesProps = {
  onChallengeCompleted?: (payload: CompleteResponse, challengeId: number) => void;
};

export default function ViewChallenges({ onChallengeCompleted }: ViewChallengesProps) {
  const { token } = useAuth();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const load = async () => {
      try {
        // 1) Load global challenges
        const chRes = await fetch(`${API_BASE_URL}/api/challenges/`, {
          credentials: "include",
        });
        if (!chRes.ok) throw new Error("Failed loading challenges");
        const allChallenges: Challenge[] = await chRes.json();
        setChallenges(allChallenges);

        // 2) Load user's completed challenges
        if (token) {
          const ucRes = await fetch(`${API_BASE_URL}/api/challenges/user`, {
            headers,
            credentials: "include",
          });

          if (ucRes.ok) {
            const userCh: UserChallenge[] = await ucRes.json();
            const completedSet = new Set(
              userCh.filter((c) => c.completed_at).map((c) => c.challenge_id)
            );
            setCompleted(completedSet);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Could not load challenges");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const toggleComplete = async (challengeId: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/challenges/user/${challengeId}/complete`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Could not complete challenge");

      const body: CompleteResponse = await res.json();

      setCompleted((prev) => new Set(prev).add(challengeId));

      // 🔔 Tell the parent (Dashboard) so it can refresh leaderboard/XP
      if (onChallengeCompleted) {
        onChallengeCompleted(body, challengeId);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark challenge complete");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-4 rounded-xl">
        Loading challenges...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] p-4 rounded-xl text-red-500">
        {error}
      </div>
    );
  }

  const daily = challenges.filter((c) => c.type.toLowerCase() === "daily");
  const weekly = challenges.filter((c) => c.type.toLowerCase() === "weekly");

  const renderRow = (c: Challenge) => {
    const isDone = completed.has(c.id);

    return (
      <div key={c.id} className="flex justify-between items-center py-2">
        <div>
          <p className="font-semibold text-sm">{c.title}</p>
          {c.description && (
            <p className="text-xs">{c.description}</p>
          )}
          <p className="text-xs">{c.points} XP</p>
        </div>

        <input
          type="checkbox"
          checked={isDone}
          disabled={isDone}
          onChange={() => toggleComplete(c.id)}
          className="w-5 h-5 accent-green-500 cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="bg-[#1a1a1a] p-6 border border-gray-300 rounded-xl shadow w-[500px]">
      <h2 className="text-lg font-bold mb-3">Challenges</h2>

      <div className="mb-4">
        <h3 className="text-sm font-semibold">Daily</h3>
        {daily.map(renderRow)}
      </div>

      <div>
        <h3 className="text-sm font-semibold">Weekly</h3>
        {weekly.map(renderRow)}
      </div>
    </div>
  );
}
