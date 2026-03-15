"use client";

import type { ShelfOverlayMode } from "@/types/shelf";

interface ShelfSortToggleProps {
  mode: ShelfOverlayMode;
  onModeChange: (mode: ShelfOverlayMode) => void;
}

const modes: { value: ShelfOverlayMode; label: string }[] = [
  { value: "score", label: "Score" },
  { value: "price", label: "Price" },
  { value: "ratio", label: "Ratio" },
];

export default function ShelfSortToggle({
  mode,
  onModeChange,
}: ShelfSortToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full bg-gray-100 p-1">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            mode === m.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
