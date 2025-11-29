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

type ExerciseInfoModalProps = {
  exercise: Exercise;
  onClose: () => void;
};

const ExerciseInfoModal = ({ exercise, onClose }: ExerciseInfoModalProps) => {
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
          {/* GIF/Animation */}
          <div className="w-full bg-[#2a2a2a] rounded-xl mb-6 flex items-center justify-center overflow-hidden">
            {exercise.gif_url ? (
              <img
                src={exercise.gif_url}
                alt={exercise.name}
                className="w-full max-w-md h-auto"
              />
            ) : exercise.thumbnail_url ? (
              <img
                src={exercise.thumbnail_url}
                alt={exercise.name}
                className="w-full max-w-md h-auto"
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <span className="text-gray-500">No animation available</span>
              </div>
            )}
          </div>

          {/* Exercise name */}
          <h3 className="text-2xl font-bold mb-4">{exercise.name}</h3>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-6">
            {exercise.body_part && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                {exercise.body_part}
              </span>
            )}
            {exercise.equipment_type && (
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                {exercise.equipment_type}
              </span>
            )}
            {exercise.muscle_group && (
              <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                {exercise.muscle_group}
              </span>
            )}
          </div>

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
