import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type WorkoutBest = {
  exercise_id: number;
  exercise_name: string;
  max_weight: number | null;
  reps_at_max: number;
};

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth() as any;
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="text-center">No user data available.</div>
      </div>
    );
  }

  const heightInches = user.height ?? 0;
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  const [unit, setUnit] = React.useState<'kg' | 'lbs'>('lbs');
  const [bests, setBests] = React.useState<WorkoutBest[]>([]);
  const [bestsLoading, setBestsLoading] = React.useState(false);
  const [latestAnswers, setLatestAnswers] = React.useState<Array<{ question_id: number; question_text: string; answer_value: string; updated_at: string }>>([]);
  const [answersLoading, setAnswersLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchBests = async () => {
      setBestsLoading(true);
      try {
        const res = await api.get<WorkoutBest[]>('/workouts/bests');
        setBests(res.data ?? []);
      } catch (err) {
        console.error('Failed to fetch workout bests:', err);
      } finally {
        setBestsLoading(false);
      }
    };

    if (user) {
      fetchBests();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#2a2a2a] p-6 pt-24 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-semibold">{user.first_name ? `${user.first_name}'s Profile` : `${user.username}'s Profile`}</h1>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left column: Statistics + Personal Bests */}
          <div className="col-span-8">
            <div className="bg-[#1a1a1a] rounded-3xl p-6 shadow-lg border border-[#151515]">
              <h2 className="text-2xl font-semibold mb-4">Statistics</h2>

              <div className="flex gap-6 mb-6">
                <div className="flex-1 bg-[#151515] rounded-lg p-4 flex items-center gap-4">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <div className="text-2xl font-bold">{user.streak ?? 0}</div>
                    <div className="text-sm text-gray-300">Day Streak</div>
                  </div>
                </div>

                <div className="flex-1 bg-[#151515] rounded-lg p-4 flex items-center gap-4">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <div className="text-2xl font-bold">{user.total_xp ?? 0}</div>
                    <div className="text-sm text-gray-300">Total XP</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] rounded-xl p-6 h-80 overflow-auto">
                <div className="font-mono text-lg font-semibold mb-3">Personal Bests</div>
                {bestsLoading && <div className="text-sm text-gray-400">Loading...</div>}
                {!bestsLoading && bests.length === 0 && (
                  <div className="text-sm text-gray-400">No workouts recorded yet.</div>
                )}
                {!bestsLoading && bests.length > 0 && (
                  <div className="text-sm text-gray-300 space-y-2">
                    {bests.map((best) => (
                      <div key={best.exercise_id}>
                        {best.exercise_name} — {best.max_weight ? `${best.max_weight} kg` : '—'} x {best.reps_at_max} reps
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Details */}
          <div className="col-span-4">
            <div className="bg-[#1a1a1a] rounded-3xl p-6 shadow-lg border border-[#151515]">
                <div className="mb-4">
                  <button
                    onClick={() => navigate('/questionnaire')}
                    className="w-full bg-[#111111] text-white rounded-lg py-3 font-semibold"
                  >
                    Retake Questionnaire?
                  </button>
                </div>

                <div className="mb-4">
                  <button
                    onClick={async () => {
                      setAnswersLoading(true);
                      try {
                        const res = await api.get('/questionnaire/latest');
                        setLatestAnswers(res.data || []);
                      } catch (err) {
                        console.error('Failed to load latest answers', err);
                        alert('Could not load latest questionnaire answers.');
                      } finally {
                        setAnswersLoading(false);
                      }
                    }}
                    className="w-full bg-[#111111] text-white rounded-lg py-3 font-semibold"
                  >
                    {answersLoading ? 'Loading...' : 'Show Latest Questionnaire'}
                  </button>
                </div>

                {latestAnswers.length > 0 && (
                  <div className="mt-4 bg-[#0f0f0f] rounded-lg p-4">
                    <div className="font-semibold mb-2">Most Recent Answers</div>
                    <div className="text-sm text-gray-300 space-y-2">
                      {latestAnswers.map((a) => (
                        <div key={a.question_id}>
                          <div className="font-medium">{a.question_text}</div>
                          <div className="text-xs text-gray-400">{a.answer_value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-mono">Age:</div>
                  <div className="text-lg">{user.age ?? '—'}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-mono">Height:</div>
                  <div className="text-lg">{heightInches ? `${feet}' ${inches}"` : '—'}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-mono">Weight:</div>
                  <div className="text-lg">
                    {user.weight == null
                      ? '—'
                      : unit === 'kg'
                      ? `${user.weight} kg`
                      : `${Math.round(user.weight * 2.20462)} lbs`}
                  </div>
                </div>

                {/* Units toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnit('kg')}
                    className={`flex-1 py-2 rounded ${unit === 'kg' ? 'bg-blue-600 text-white' : 'bg-[#111111] text-gray-300'}`}>
                    kg
                  </button>
                  <button
                    onClick={() => setUnit('lbs')}
                    className={`flex-1 py-2 rounded ${unit === 'lbs' ? 'bg-blue-600 text-white' : 'bg-[#111111] text-gray-300'}`}>
                    lbs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
