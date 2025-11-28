import { useAuth } from "../../context/AuthContext";

const FoodResultItem = ({name, calories, code, onPress}: {name: string, calories: number, code: string, onPress: (code: string) => void}) => {
    const { isAuthenticated } = useAuth();

    return (
        <div 
            onClick={() => {
                onPress(code);
                console.log(`Pressed section ${name} with code: ${code}`);
            }}
            className="w-full px-5 py-4 rounded-2xl bg-[#1a1a1a] border flex justify-between items-center hover:bg-[#101010] cursor-pointer transition mb-4"
        >
            <div>
                <h2 className="text-lg font-semibold">
                    {name}
                </h2>
                {calories !== undefined && calories !== null && (
                <p className="text-sm">
                    Calories (per 100g): {calories}
                </p>
                )}
            </div>

            {isAuthenticated && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Tapped click of section ${name} with code: ${code}`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                Add
                </button>
            )}
        </div>
    );
};

export default FoodResultItem;