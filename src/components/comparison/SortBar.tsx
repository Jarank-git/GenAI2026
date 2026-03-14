"use client";

import type { SortMode } from "@/types/alternatives";

interface SortBarProps {
  activeMode: SortMode;
  onModeChange: (mode: SortMode) => void;
}

const modes: { key: SortMode; label: string; icon: string }[] = [
  { key: "green", label: "Green", icon: "\u{1F33F}" },
  { key: "budget", label: "Budget", icon: "\u{1F4B2}" },
  { key: "sweet_spot", label: "Sweet Spot", icon: "\u2B50" },
  { key: "planet_pick", label: "Planet Pick", icon: "\u{1F30D}" },
];

export default function SortBar({ activeMode, onModeChange }: SortBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-3 px-1">
      {modes.map(({ key, label, icon }) => {
        const isActive = activeMode === key;
        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
