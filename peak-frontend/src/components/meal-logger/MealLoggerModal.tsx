import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

type MealLabel = "breakfast" | "lunch" | "dinner" | "snack";

type MealLoggerFood = {
    id: number;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
};

type MealItemResponse = {
  id: number;
  meal_id: number;
  food_id: number;
  qty: number;
  meal_label: MealLabel;
  food: MealLoggerFood;
};

type MealWithItemsResponse = {
  meal: {
    id: number;
    eaten_at: string;
  };
  items: MealItemResponse[];
};

type MealItemClient = {
    id?: number;
    food_id: number;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
    qty: number;
    meal_label: MealLabel;
  };

type MealLoggerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onMealSaved: () => void;
};

const DAILY_CALORIE_TARGET = 2300; // WILL CHANGE WITH QUESTIONNAIRRE

const labelDisplay: Record<MealLabel, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MealLoggerModal = ({ isOpen, onClose, onMealSaved }: MealLoggerModalProps) => {
  const [items, setItems] = useState<MealItemClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const fetchToday = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<MealWithItemsResponse | null>("/meal-logger/today");
        const data = res.data;

        if (!data) {
          setItems([]);
          return;
        }

        const mapped: MealItemClient[] = data.items.map((item) => ({
            id: item.id,
            food_id: item.food_id,
            name: item.food.name,
            calories_per_100g: item.food.calories_per_100g,
            protein_per_100g: item.food.protein_per_100g ?? 0,
            carbs_per_100g: item.food.carbs_per_100g ?? 0,
            fats_per_100g: item.food.fats_per_100g ?? 0,
            qty: item.qty,
            meal_label: item.meal_label,
        }));

        setItems(mapped);
      } catch (err: any) {
        console.error("Error fetching today's meal log: ", err);
        setError("Failed to load today's meal log.");
      } finally {
        setLoading(false);
      }
    };

    fetchToday();
  }, [isOpen]);

  const totalCalories = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.qty / 100) * (item.calories_per_100g ?? 0),
        0
      ),
    [items]
  );

  const totalProtein = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.qty / 100) * (item.protein_per_100g ?? 0),
        0
      ),
    [items]
  );
  
  const totalCarbs = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.qty / 100) * (item.carbs_per_100g ?? 0),
        0
      ),
    [items]
  );
  
  const totalFats = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.qty / 100) * (item.fats_per_100g ?? 0),
        0
      ),
    [items]
  );

  const caloriesByLabel: Record<MealLabel, number> = useMemo(() => {
    const acc: Record<MealLabel, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };

    for (const item of items) {
      acc[item.meal_label] +=
        (item.qty / 100) * (item.calories_per_100g ?? 0);
    }

    return acc;
  }, [items]);

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditItemQty = (index: number) => {
    // Read current qty from the current items array
    const target = items[index];
    if (!target) return;
  
    const currentQty = target.qty;
    const input = window.prompt(
      `Edit grams for "${target.name}"`,
      String(currentQty)
    );
    if (!input) return;
  
    const newQty = Number(input);
    if (!Number.isFinite(newQty) || newQty <= 0) {
      window.alert("Quantity must be a positive number.");
      return;
    }

    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: newQty } : it
      )
    );
  };

  const handleAddFoodForLabel = (label: MealLabel) => {
    // Close modal and go to Nutrition page with preset label
    onClose();
    navigate(`/nutrition?label=${label}`);
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        eaten_at: null, // let backend use "today"
        items: items.map((item) => ({
          food_id: item.food_id,
          qty: item.qty,
          meal_label: item.meal_label,
        })),
      };

      const res = await api.post<MealWithItemsResponse>("/meal-logger/complete", payload);
      const data = res.data;

      const mapped: MealItemClient[] = data.items.map((item) => ({
        id: item.id,
        food_id: item.food_id,
        name: item.food.name,
        calories_per_100g: item.food.calories_per_100g,
        protein_per_100g: item.food.protein_per_100g ?? 0,
        carbs_per_100g: item.food.carbs_per_100g ?? 0,
        fats_per_100g: item.food.fats_per_100g ?? 0,
        qty: item.qty,
        meal_label: item.meal_label,
      }));

      setItems(mapped);
      onMealSaved();
      onClose();
    } catch (err) {
      console.error("Error completing meal log:", err);
      setError("Failed to save today's meal log.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl mx-4 rounded-2xl bg-[#181818] border border-[#333] p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-2xl leading-none"
          onClick={onClose}
        >
          ×
        </button>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Nutrition Log – Today
        </h1>
        <p className="text-sm mb-4">
          Track your meals across breakfast, lunch, dinner, and snacks.
        </p>

        {/* Status / Errors */}
        {loading && (
          <p className="text-sm mb-3">Loading today&apos;s log...</p>
        )}
        {error && (
          <p className="text-sm text-red-400 mb-3">{error}</p>
        )}

        {/* Summary */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm">
                Total Calories:{" "}
                <span className="font-semibold">
                    {Math.round(totalCalories)}
                </span>
                </span>
                <span className="text-xs text-gray-400">
                Goal: {DAILY_CALORIE_TARGET} kcal
                </span>
            </div>

            <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden">
                <div
                className="h-full bg-green-500 transition-all"
                style={{
                    width: `${Math.min(
                    (totalCalories / DAILY_CALORIE_TARGET) * 100,
                    100
                    ).toFixed(1)}%`,
                }}
                />
            </div>

            {/* Macros summary */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs md:text-sm text-gray-200">
                <span>
                Protein:{" "}
                <span className="font-semibold">
                    {totalProtein.toFixed(1)} g
                </span>
                </span>
                <span>
                Carbs:{" "}
                <span className="font-semibold">
                    {totalCarbs.toFixed(1)} g
                </span>
                </span>
                <span>
                Fat:{" "}
                <span className="font-semibold">
                    {totalFats.toFixed(1)} g
                </span>
                </span>
            </div>
        </div>

        {/* Sections: Breakfast / Lunch / Dinner / Snacks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(Object.keys(labelDisplay) as MealLabel[]).map((label) => {
            const sectionItems = items.filter(
              (i) => i.meal_label === label
            );
            const sectionCals = Math.round(caloriesByLabel[label]);

            return (
              <div
                key={label}
                className="rounded-xl bg-[#1f1f1f] border border-[#333] p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">
                    {labelDisplay[label]}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {sectionCals} kcal
                  </span>
                </div>

                <div className="flex-1 space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                  {sectionItems.length === 0 && (
                    <p className="text-xs text-gray-500 italic">
                      No items logged yet.
                    </p>
                  )}
                  {sectionItems.map((item, idx) => {
                    const itemIndex = items.findIndex(
                      (it) =>
                        it.food_id === item.food_id &&
                        it.meal_label === item.meal_label &&
                        it.qty === item.qty &&
                        it.name === item.name
                    );
                    const kcal =
                      (item.qty / 100) * item.calories_per_100g;

                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-[#242424] rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.qty} g · {Math.round(kcal)} kcal
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() =>
                              handleEditItemQty(itemIndex)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs text-red-400 hover:text-red-300"
                            onClick={() =>
                              handleRemoveItem(itemIndex)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="mt-auto text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleAddFoodForLabel(label)}
                  disabled={saving}
                >
                  + Add food to {labelDisplay[label]}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleComplete}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealLoggerModal;
