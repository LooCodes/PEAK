// src/components/nutrition/FoodResultItem.tsx
import { useAuth } from "../../context/AuthContext";

type Props = {
  id: number;
  name: string;
  calories: number;
  openfood_code: string | null;
  onPress: (code: string | null) => void;
  onAdd?: (foodId: number, name: string, caloriesPer100g: number) => void;
};

const FoodResultItem = ({
  id,
  name,
  calories,
  openfood_code,
  onPress,
  onAdd,
}: Props) => {
  const { isAuthenticated } = useAuth();

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAdd) return;
    onAdd(id, name, calories);
  };

  return (
    <div
      onClick={() => {
        onPress(openfood_code);
        console.log(`Pressed section ${name} with code: ${openfood_code}`);
      }}
      className="w-full px-5 py-4 rounded-2xl bg-[#1a1a1a] border flex justify-between items-center hover:bg-[#101010] cursor-pointer transition mb-4"
    >
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        {calories !== undefined && calories !== null && (
          <p className="text-sm">Calories (per 100g): {calories}</p>
        )}
      </div>

      {isAuthenticated && onAdd && (
        <button
          onClick={handleAddClick}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Add
        </button>
      )}
    </div>
  );
};

export default FoodResultItem;
