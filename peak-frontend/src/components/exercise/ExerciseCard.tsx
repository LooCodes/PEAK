// src/components/exercise/ExerciseCard.tsx
import React from "react";

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

type ExerciseCardProps = {
  exercise: Exercise;
  isAuthenticated: boolean;
  onCardClick: () => void;
  onAddClick?: () => void; // ✅ make this optional
};

const ExerciseCard = ({
  exercise,
  isAuthenticated,
  onCardClick,
  onAddClick,
}: ExerciseCardProps) => {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddClick) {
      onAddClick();
    }
  };

  return (
    <div
      onClick={onCardClick}
      className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 hover:bg-[#242424] cursor-pointer transition flex items-center gap-4"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 bg-[#2a2a2a] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
        {exercise.thumbnail_url ? (
          <img
            src={exercise.thumbnail_url}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 text-xs">No image</span>
        )}
      </div>

      {/* Exercise name only (no tags) */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1">{exercise.name}</h3>
      </div>

      {/* Add button – only in browse mode when onAddClick is provided */}
      {isAuthenticated && onAddClick && (
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex-shrink-0 text-sm font-medium"
        >
          Add
        </button>
      )}
    </div>
  );
};

export default ExerciseCard;
