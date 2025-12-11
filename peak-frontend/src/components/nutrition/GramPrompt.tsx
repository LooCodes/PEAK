import { useState } from "react"

interface GramPromptProps {
  isOpen: boolean;
  foodName: string;
  defaultValue?: string;
  onClose: () => void;
  onSubmit: (grams: number) => void;
}

export default function GramPrompt({
  isOpen,
  foodName,
  defaultValue = "100",
  onClose,
  onSubmit
}: GramPromptProps) {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 w-[90%] max-w-md">
        
        <h2 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100">
          How many grams did you eat?
        </h2>

        <p className="text-neutral-500 mb-4">
          Food: <span className="font-medium text-neutral-700 dark:text-neutral-300">{foodName}</span>
        </p>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700
                     bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200
                     focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 
                       transition text-neutral-800 dark:text-neutral-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              const grams = Number(value);
              if (!isNaN(grams) && grams > 0) onSubmit(grams);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition 
                       text-white font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
