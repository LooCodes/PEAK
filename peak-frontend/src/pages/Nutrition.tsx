import { FormEvent, useState } from "react";
import api from "../api/axios";
import FoodResultItem from "../components/nutrition/FoodResultItem";
import NutritionInformation from "../components/nutrition/NutritionInformation";

type FoodSearchItem = {
  id: number;
  openfood_code: string | null;
  name: string;
  calories_per_100g: number | null;
};

type FoodSearchResponse = {
  results: FoodSearchItem[];
};

const Nutrition = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const res = await api.get<FoodSearchResponse>("/nutrition/search", {
        params: { query: query },
      });

      setResults(res.data.results || []);
    } catch (err) {
      setError("Failed to fetch foods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] pt-24 pb-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide pt-22 text-center">
                EAT!
            </h1>

            {/* Search bar */}
            <form
            onSubmit={handleSearch}
            className="mb-8 bg-[#181818] border border-[#2a2a2a] rounded-2xl px-5 py-3 flex items-center gap-3"
            >
                <span className="text-xl">🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a meal..."
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
                {results.filter(item => item.name && item.name.trim() !== "").map(item => (
                  <FoodResultItem
                    key={`${item.openfood_code}-${item.name}`}
                    name={item.name}
                    calories={item.calories_per_100g ?? 0}
                    openfood_code={item.openfood_code}
                    onPress={(code) => setSelectedCode(code)}
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
    </div>
  );
};

export default Nutrition;
