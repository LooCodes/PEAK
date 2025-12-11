// src/components/workouts/StartWorkoutModal.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

type StartWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutSaved: () => void; 
};

type WorkoutSetRow = {
  setNo: number;
  weight: string; // keep as string for input
  reps: string;
  durationSeconds: string;
};

type WorkoutExerciseRow = {
  id: string;
  name: string;
  sets: WorkoutSetRow[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function createEmptySetRow(setNo: number): WorkoutSetRow {
  return {
    setNo,
    weight: "",
    reps: "",
    durationSeconds: "",
  };
}

function createEmptyExerciseRow(index: number): WorkoutExerciseRow {
  return {
    id: `exercise-${Date.now()}-${index}`,
    name: "",
    sets: [createEmptySetRow(1)],
  };
}

const StartWorkoutModal = ({
  isOpen,
  onClose,
  onWorkoutSaved,
}: StartWorkoutModalProps) => {
  const { token } = useAuth();

  const [exercises, setExercises] = useState<WorkoutExerciseRow[]>([
    createEmptyExerciseRow(0),
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const updateExerciseName = (idx: number, value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === idx
          ? {
              ...ex,
              name: value,
            }
          : ex
      )
    );
  };

  const updateSetField = (
    exIdx: number,
    setIdx: number,
    field: keyof WorkoutSetRow,
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const newSets = ex.sets.map((set, j) =>
          j === setIdx
            ? {
                ...set,
                [field]: value,
              }
            : set
        );
        return { ...ex, sets: newSets };
      })
    );
  };

  const addSetRow = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const nextSetNo = ex.sets.length + 1;
        return {
          ...ex,
          sets: [...ex.sets, createEmptySetRow(nextSetNo)],
        };
      })
    );
  };

  const removeSetRow = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const remaining = ex.sets.filter((_, j) => j !== setIdx);
        const resequenced = remaining.map((s, idx2) => ({
          ...s,
          setNo: idx2 + 1,
        }));
        return { ...ex, sets: resequenced };
      })
    );
  };

  const addExerciseRow = () => {
    setExercises((prev) => [...prev, createEmptyExerciseRow(prev.length)]);
  };

  const removeExerciseRow = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const resetForm = () => {
    setExercises([createEmptyExerciseRow(0)]);
    setNotes("");
  };

  const handleDiscard = () => {
    resetForm();
    onClose();
  };

  const handleSaveWorkout = async () => {
    if (!token) {
      alert("Please log in to save workouts.");
      return;
    }

    const payload = {
      performed_at: new Date().toISOString(),
      notes: notes.trim() === "" ? null : notes.trim(),
      exercises: exercises
        .filter((ex) => ex.name.trim().length > 0)
        .map((ex) => ({
          name: ex.name.trim(),
          sets: ex.sets
            .filter(
              (s) =>
                s.reps.trim() !== "" ||
                s.weight.trim() !== "" ||
                s.durationSeconds.trim() !== ""
            )
            .map((s) => ({
              set_no: s.setNo,
              reps: s.reps.trim() === "" ? null : Number(s.reps),
              weight: s.weight.trim() === "" ? null : Number(s.weight),
              duration_seconds:
                s.durationSeconds.trim() === ""
                  ? null
                  : Number(s.durationSeconds),
            })),
        })),
    };

    if (payload.exercises.length === 0) {
      alert("Please add at least one exercise with at least one set.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/workouts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Save workout failed", res.status, text);

        if (res.status === 401) {
          alert("Your session has expired. Please log in again.");
        } else {
          alert(
            `Failed to save workout (${res.status}). Check console for details.`
          );
        }
        return;
      }

      
      alert("Workout saved!");
      onWorkoutSaved();

      resetForm();
      onClose();
    } catch (err) {
      console.error("Network error saving workout:", err);
      alert("Failed to save workout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleDiscard}
    >
      <div
        className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#333] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Start a Workout</h2>
          <button
            onClick={handleDiscard}
            className="text-3xl hover:text-gray-400 transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-[#111] border border-[#333] px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="How are you feeling today? Any goals for this session?"
            />
          </div>

          {/* Exercises */}
          <div className="space-y-6">
            {exercises.map((exercise, exIdx) => (
              <div
                key={exercise.id}
                className="border border-[#333] rounded-2xl p-4 bg-[#181818]"
              >
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-gray-300">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExerciseName(exIdx, e.target.value)
                      }
                      className="w-full rounded-xl bg-[#111] border border-[#333] px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Barbell Squat"
                    />
                  </div>

                  {exercises.length > 1 && (
                    <button
                      onClick={() => removeExerciseRow(exIdx)}
                      className="text-xs text-red-400 hover:text-red-500"
                    >
                      Remove Exercise
                    </button>
                  )}
                </div>

                {/* Sets table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-[#333]">
                        <th className="py-2 pr-4">Set</th>
                        <th className="py-2 pr-4">Weight</th>
                        <th className="py-2 pr-4">Reps</th>
                        <th className="py-2 pr-4">Duration (sec)</th>
                        <th className="py-2 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, setIdx) => (
                        <tr key={setIdx} className="border-b border-[#222]">
                          <td className="py-2 pr-4 text-gray-300">
                            {set.setNo}
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              min={0}
                              value={set.weight}
                              onChange={(e) =>
                                updateSetField(
                                  exIdx,
                                  setIdx,
                                  "weight",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg bg-[#111] border border-[#333] px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                              placeholder="lbs"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              min={0}
                              value={set.reps}
                              onChange={(e) =>
                                updateSetField(
                                  exIdx,
                                  setIdx,
                                  "reps",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg bg-[#111] border border-[#333] px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                              placeholder="reps"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              min={0}
                              value={set.durationSeconds}
                              onChange={(e) =>
                                updateSetField(
                                  exIdx,
                                  setIdx,
                                  "durationSeconds",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg bg-[#111] border border-[#333] px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                              placeholder="sec"
                            />
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {exercise.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSetRow(exIdx, setIdx)}
                                className="text-xs text-red-400 hover:text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => addSetRow(exIdx)}
                  className="mt-3 px-3 py-1.5 rounded-full border border-[#444] text-xs text-gray-200 hover:border-blue-500"
                >
                  + Add Set
                </button>
              </div>
            ))}
          </div>

          {/* Add Exercise */}
          <button
            type="button"
            onClick={addExerciseRow}
            className="px-4 py-2 rounded-full border border-[#444] text-sm text-gray-200 hover:border-blue-500"
          >
            + Add Exercise
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded-full bg-[#2a2a2a] text-sm text-gray-200 hover:bg-[#333]"
            disabled={saving}
          >
            Discard
          </button>
          <button
            onClick={handleSaveWorkout}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-sm text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartWorkoutModal;
