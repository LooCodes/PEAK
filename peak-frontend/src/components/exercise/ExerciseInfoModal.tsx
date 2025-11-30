// src/components/exercise/ExerciseInfoModal.tsx

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

type ExerciseInfoModalProps = {
  exercise: Exercise;
  onClose: () => void;
  isLoadingDetails?: boolean;
};

// Convert "QUADRICEPS", "upper_arms", "lower-arms" → "Quadriceps", "Upper Arms", "Lower Arms"
const prettify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[_-]/g, " ");

const ExerciseInfoModal = ({
  exercise,
  onClose,
  isLoadingDetails = false,
}: ExerciseInfoModalProps) => {
  // Build tags by category so we can color them differently
  const rawTags = [
    { label: exercise.body_part, type: "body" },
    { label: exercise.equipment_type, type: "equipment" },
    { label: exercise.muscle_group, type: "muscle" },
  ].filter((t) => t.label) as { label: string; type: string }[];

  // Deduplicate tags case-insensitively
  const uniqueTags = Array.from(
    new Map(rawTags.map((tag) => [normalize(tag.label), tag])).values()
  );

  const imageSrc = exercise.gif_url || exercise.thumbnail_url || "";

  const getTagStyle = (type: string) => {
    switch (type) {
      case "body":
        return "bg-blue-600/20 text-blue-400"; // Body Part
      case "equipment":
        return "bg-purple-600/20 text-purple-400"; // Equipment
      case "muscle":
        return "bg-green-600/20 text-green-400"; // Muscle Group
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#333] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Exercise Info</h2>
          <button
            onClick={onClose}
            className="text-3xl hover:text-gray-400 transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image (smaller & consistent) */}
          <div className="w-full mb-6 flex justify-center">
            <div className="w-[260px] h-[260px] bg-[#2a2a2a] rounded-xl flex items-center justify-center overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500 text-sm">No image available</span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-4">{exercise.name}</h3>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-6">
            {uniqueTags.map((tag) => (
              <span
                key={`${tag.type}-${tag.label}`}
                className={`px-3 py-1 rounded-full text-sm ${getTagStyle(
                  tag.type
                )}`}
              >
                {prettify(tag.label)}
              </span>
            ))}
          </div>

          {/* Loading state */}
          {isLoadingDetails && (
            <p className="text-sm text-gray-400 mb-4">
              Loading detailed instructions…
            </p>
          )}

          {/* Instructions */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Instructions</h4>
            {exercise.instructions && exercise.instructions.length > 0 ? (
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-blue-500 font-bold flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="text-gray-300">{instruction}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">No instructions available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseInfoModal;
