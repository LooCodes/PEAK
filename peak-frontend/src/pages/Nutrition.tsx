import { FormEvent, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import FoodResultItem from "../components/nutrition/FoodResultItem";
import NutritionInformation from "../components/nutrition/NutritionInformation";
import GramPrompt from "../components/nutrition/GramPrompt";
import PeakAlert from "../components/PeakAlert";

type FoodSearchItem = {
  id: number;
  openfood_code: string | null;
  name: string;
  calories_per_100g: number | null;
};

type FoodSearchResponse = {
  results: FoodSearchItem[];
};

type MealLabel = "breakfast" | "lunch" | "dinner" | "snack";
const VALID_LABELS: MealLabel[] = ["breakfast", "lunch", "dinner", "snack"];

type PendingFood = {
  foodId: number;
  name: string;
  caloriesPer100g: number;
};

const Nutrition = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const [pendingFood, setPendingFood] = useState<PendingFood | null>(null);
  const [isGramPromptOpen, setIsGramPromptOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const presetLabelRaw = (searchParams.get("label") || "").toLowerCase();
  const presetLabel = VALID_LABELS.includes(presetLabelRaw as MealLabel)
    ? (presetLabelRaw as MealLabel)
    : null;

  const isFromLogger = !!presetLabel;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.get<FoodSearchResponse>("/nutrition/search", {
        params: { query: trimmed },
      });

      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch foods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMealLogger = (
    foodId: number,
    name: string,
    caloriesPer100g: number
  ) => {
    if (!presetLabel) return;

    setPendingFood({ foodId, name, caloriesPer100g });
    setIsGramPromptOpen(true);
  };

  const submitGrams = async (grams: number) => {
    if (!presetLabel || !pendingFood) return;

    try {
      type MealItemForPayload = {
        food_id: number;
        qty: number;
        meal_label: MealLabel;
      };

      let existingItems: MealItemForPayload[] = [];

      try {
        const res = await api.get<{
          meal: { id: number; eaten_at: string };
          items: { food_id: number; qty: number; meal_label: MealLabel }[];
        } | null>("/meal-logger/today");

        const data = res.data;
        if (data && data.items) {
          existingItems = data.items.map((i) => ({
            food_id: i.food_id,
            qty: i.qty,
            meal_label: i.meal_label,
          }));
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error("Error fetching today's meal log before Add:", err);
          setAlertMessage("Something went wrong while reading today's log.");
          return;
        }
      }

      const payload = {
        eaten_at: null,
        items: [
          ...existingItems,
          {
            food_id: pendingFood.foodId,
            qty: grams,
            meal_label: presetLabel,
          },
        ],
      };

      await api.post("/meal-logger/complete", payload);

      setIsGramPromptOpen(false);
      setPendingFood(null);

      navigate("/dashboard?openMealLogger=1");
    } catch (err) {
      console.error("Error adding food to meal logger:", err);
      setAlertMessage("Failed to add this food to your meal log.");
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] pt-24 pb-10 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide pt-22 text-center">
          FOOD.
        </h1>

        {isFromLogger && presetLabel && (
          <p className="text-center text-xs text-gray-400 mb-2">
            You&apos;re adding food for <strong>{presetLabel}</strong>.
          </p>
        )}

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mb-8 bg-[#181818] border border-[#2a2a2a] rounded-2xl px-5 py-3 flex items-center gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food..."
            className="w-full bg-transparent outline-none text-sm md:text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-sm md:text-base px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Status text */}
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {!loading && !error && results.length === 0 && query.trim() && (
          <p className="text-sm text-gray-500 mb-4">
            No results found for &quot;{query.trim()}&quot;.
          </p>
        )}

        {/* Results list */}
        <div className="space-y-0">
          {results
            .filter((item) => item.name && item.name.trim() !== "")
            .map((item) => (
              <FoodResultItem
                key={`${item.id}-${item.name}`}
                id={item.id}
                name={item.name}
                calories={item.calories_per_100g ?? 0}
                openfood_code={item.openfood_code}
                onPress={(code) => code && setSelectedCode(code)}
                onAdd={isFromLogger ? handleAddToMealLogger : undefined}
              />
            ))}
        </div>
      </div>

      {selectedCode && (
        <NutritionInformation
          openfood_code={selectedCode}
          onClose={() => setSelectedCode(null)}
        />
      )}

      {pendingFood && (
        <GramPrompt
          isOpen={isGramPromptOpen}
          foodName={pendingFood.name}
          defaultValue="100"
          onClose={() => {
            setIsGramPromptOpen(false);
            setPendingFood(null);
          }}
          onSubmit={submitGrams}
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

export default Nutrition;
