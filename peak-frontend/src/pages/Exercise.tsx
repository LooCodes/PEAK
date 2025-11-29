import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ExerciseCard from "../components/exercise/ExerciseCard";
import ExerciseInfoModal from "../components/exercise/ExerciseInfoModal";

type Exercise = {
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

const Exercise = () => {
  const { isAuthenticated } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const bodyParts = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Cardio"];
  const equipmentTypes = ["At Home", "Free Weights", "Machine", "Bands"];

  useEffect(() => {
    fetchExercises();
  }, [selectedBodyPart, selectedEquipmentType]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { body_part?: string; equipment_type?: string } = {};
      if (selectedBodyPart) params.body_part = selectedBodyPart;
      if (selectedEquipmentType) params.equipment_type = selectedEquipmentType;

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

  const handleAddExercise = async (exerciseId: number) => {
    if (!isAuthenticated) {
      alert("Please log in to add exercises to your workout.");
      return;
    }

    try {
      await api.post("/exercises/user/workout-exercises", {
        exercise_id: exerciseId,
      });
      alert("Exercise added to your workout!");
    } catch (err: any) {
      console.error("Error adding exercise:", err);
      if (err.response?.status === 400) {
        alert(err.response?.data?.detail || "Exercise already in your workout.");
      } else {
        alert("Failed to add exercise. Please try again.");
      }
    }
  };

  const handleBodyPartClick = (bodyPart: string) => {
    if (selectedBodyPart === bodyPart) {
      setSelectedBodyPart(null);
    } else {
      setSelectedBodyPart(bodyPart);
    }
  };

  const handleEquipmentClick = (equipment: string) => {
    setSelectedEquipmentType(equipment);
    setShowMoreMenu(false);
  };

  const clearFilters = () => {
    setSelectedBodyPart(null);
    setSelectedEquipmentType(null);
  };

  return (
    <div className="min-h-screen bg-[#212121] pt-24 pb-10 px-4">
      {/* Hero area with placeholders */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-2xl h-32 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Promo Image 1</span>
          </div>
          <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-2xl h-32 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Promo Image 2</span>
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-center mb-6">WORKOUT!</h2>
      </div>

      {/* Filter chips */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          {bodyParts.map((part) => (
            <button
              key={part}
              onClick={() => handleBodyPartClick(part)}
              className={`px-4 py-2 rounded-full border transition ${
                selectedBodyPart === part
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[#1a1a1a] border-[#333] hover:border-blue-500"
              }`}
            >
              {part}
            </button>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`px-4 py-2 rounded-full border transition ${
                selectedEquipmentType
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[#1a1a1a] border-[#333] hover:border-blue-500"
              }`}
            >
              More ▾
            </button>

            {showMoreMenu && (
              <div className="absolute top-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-lg z-10 min-w-[160px]">
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-3 py-1">Equipment</p>
                  {equipmentTypes.map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => handleEquipmentClick(equipment)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition ${
                        selectedEquipmentType === equipment ? "text-blue-500" : ""
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear filters button */}
          {(selectedBodyPart || selectedEquipmentType) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Exercise list */}
      <div className="max-w-5xl mx-auto">
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-400">Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <p className="text-center text-gray-400">
            No exercises found. Try adjusting your filters.
          </p>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isAuthenticated={isAuthenticated}
                onCardClick={() => setSelectedExercise(exercise)}
                onAddClick={() => handleAddExercise(exercise.id)}
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
        />
      )}
    </div>
  );
};

export default Exercise;
