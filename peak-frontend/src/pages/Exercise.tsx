import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ExerciseCard from "../components/exercise/ExerciseCard";
import ExerciseInfoModal from "../components/exercise/ExerciseInfoModal";
import PeakAlert from "../components/PeakAlert";

export type Exercise = {
  id: number;
  name: string;
  type: string;
  muscle_group: string;
  body_part: string | null;
  equipment_type: string | null;
  thumbnail_url: string | null;
  gif_url: string | null;
  instructions: string[] | null;
  external_id: string | null;
};

type ExerciseListResponse = {
  exercises: Exercise[];
};

const ExercisePage = () => {
  const { isAuthenticated } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"browse" | "saved">("browse");

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === "browse") {
      fetchExercises();
    } else {
      fetchSavedExercises();
    }
  }, [viewMode]);

  const fetchExercises = async (term?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: { query?: string } = {};
      const trimmed = term !== undefined ? term.trim() : searchTerm.trim();

      if (trimmed.length > 0) {
        params.query = trimmed;
      }

      const res = await api.get<ExerciseListResponse>("/exercises", {
        params,
      });

      setExercises(res.data.exercises || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Failed to fetch exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get<ExerciseListResponse>("/exercises/saved");
      setExercises(res.data.exercises || []);
    } catch (err) {
      console.error("Error fetching saved exercises:", err);
      setError("Failed to load your saved workouts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (viewMode !== "browse") {
      setViewMode("browse");
    }

    fetchExercises(searchTerm);
  };

  const handleAddExercise = async (exercise: Exercise) => {
    if (!isAuthenticated) {
      setAlertMessage("Please log in to add exercises to your workout.");
      return;
    }

    const exerciseIdForBackend = exercise.external_id ?? exercise.id.toString();

    try {
      await api.post("/exercises/user/workout-exercises", {
        exercise_id: exerciseIdForBackend,
      });

      setAlertMessage("Exercise added to your saved workouts!");

      if (viewMode === "saved") {
        fetchSavedExercises();
      }
    } catch (err: any) {
      console.error("Error adding exercise:", err);

      let msg = "Failed to add exercise. Please try again.";

      if (err.response?.status === 400) {
        msg = err.response?.data?.detail || "Exercise already in your saved list.";
      } else if (err.response?.status === 404) {
        msg = err.response?.data?.detail || "Exercise not found.";
      }

      setAlertMessage(msg);
    }
  };

  const handleCardClick = async (exercise: Exercise) => {
    // Open modal immediately with summary data
    setSelectedExercise(exercise);
    if (!exercise.external_id) return;

    try {
      setDetailLoading(true);
      const res = await api.get<Exercise>(`/exercises/${exercise.external_id}`);
      setSelectedExercise(res.data);
    } catch (err) {
      console.error("Error fetching exercise details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] pt-24 pb-10 px-4">
      {/* Hero area */}
      <div className="max-w-5xl mx-auto mb-6">
        <h2 className="text-4xl font-extrabold text-center mb-2">Workouts.</h2>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-4 flex items-center gap-2 justify-center"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises (e.g., bench press, squat)"
            className="w-full max-w-xl px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            disabled={viewMode === "saved"}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
            disabled={viewMode === "saved"}
          >
            Search
          </button>
        </form>

        {/* View toggle: Browse vs Saved */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("browse")}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              viewMode === "browse"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-[#1a1a1a] border-[#333] text-gray-200 hover:border-blue-500"
            }`}
          >
            Browse Exercises
          </button>

          {isAuthenticated &&<button
            type="button"
            onClick={() => setViewMode("saved")}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              viewMode === "saved"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-[#1a1a1a] border-[#333] text-gray-200 hover:border-emerald-500"
            }`}
          >
            Saved Workouts
          </button>}
        </div>
      </div>

      {/* Exercise list */}
      <div className="max-w-5xl mx-auto">
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-400">
            {viewMode === "saved"
              ? "Loading your saved workouts..."
              : "Loading exercises..."}
          </p>
        ) : exercises.length === 0 ? (
          <p className="text-center text-gray-400">
            {viewMode === "saved"
              ? "You haven't saved any exercises yet. Browse and press 'Add' to save them."
              : "No exercises found. Try a different search."}
          </p>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={`${exercise.external_id ?? "mock"}-${exercise.id}`}
                exercise={exercise}
                isAuthenticated={isAuthenticated}
                onCardClick={() => handleCardClick(exercise)}
                onAddClick={
                  viewMode === "saved"
                    ? undefined // ✅ no Add button in Saved mode
                    : () => handleAddExercise(exercise)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise Info Modal */}
      {selectedExercise && (
        <ExerciseInfoModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          isLoadingDetails={detailLoading}
        />
      )}

      {alertMessage && (
        <PeakAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default ExercisePage;
