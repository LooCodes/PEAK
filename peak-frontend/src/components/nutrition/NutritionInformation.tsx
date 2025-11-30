import { useEffect, useState } from "react";
import api from "../../api/axios";

type FoodItem = {
  id: number;
  openfood_code: string | null;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  allergens: string;
};

type NutritionInformationProps = {
  openfood_code: string | null;
  onClose: () => void;
};

// const fmt = (n: number | null | undefined) =>
//   n !== null && n !== undefined ? n.toFixed(1) : "0.0";

const NutritionInformation = ({ openfood_code, onClose }: NutritionInformationProps) => {
  const [data, setData] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get<FoodItem>(`/nutrition/search/${openfood_code}`);
        setData(res.data);
      } catch (err) {
        console.error("Error loading food details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [openfood_code]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1f1f1f] border border-[#333] rounded-2xl p-8 w-[90%] max-w-3xl text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl"
        >
          ×
        </button>

        {/* Name */}
        <h1 className="text-3xl font-bold mb-4">{data.name}</h1>

        {/* Calories + Macros */}
        <div className="mb-6 text-lg">
          <p><strong>Calories (per 100g):</strong> {data.calories_per_100g !== 0.0 ? data.calories_per_100g : "N/A"}</p>
          <p><strong>Protein (per 100g):</strong> {data.protein_per_100g !== 0.0 ? data.protein_per_100g : "N/A"} g</p>
          <p><strong>Carbs (per 100g):</strong> {data.carbs_per_100g !== 0.0 ? data.carbs_per_100g : "N/A"} g</p>
          <p><strong>Fats (per 100g):</strong> {data.fats_per_100g !== 0.0 ? data.fats_per_100g : "N/A"} g</p>
        </div>

        {/* Allergens */}
        <h2 className="text-xl font-semibold mb-2">Allergens:</h2>
        {data.allergens ? (
          <ul className="list-disc pl-5">
            {data.allergens.split(",").map((a, i) => (
              <li key={i}>{a.replace(/^en:/, "").replace(/-/g, " ").trim()}</li>
            ))}
          </ul>
        ) : (
          <p>None listed</p>
        )}
      </div>
    </div>
  );
};

export default NutritionInformation;
