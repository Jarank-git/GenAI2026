"use client";

import { useState, useEffect, useCallback } from "react";
import type { VehicleProfile } from "@/types/user-profile";

interface VehicleStepProps {
  onNext: (vehicle: VehicleProfile | "transit" | "bike") => void;
  onBack: () => void;
}

interface VehicleEntry {
  make: string;
  model: string;
  year: number;
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid";
  l_per_100km: number;
  kwh_per_100km?: number;
}

export default function VehicleStep({ onNext, onBack }: VehicleStepProps) {
  const [mode, setMode] = useState<"car" | "transit" | "bike" | null>(null);
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    import("@/data/nrcan-vehicles.json").then((mod) => {
      setVehicles(mod.default as VehicleEntry[]);
    });
  }, []);

  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();

  const models = selectedMake
    ? Array.from(
        new Set(
          vehicles
            .filter((v) => v.make === selectedMake)
            .map((v) => v.model),
        ),
      ).sort()
    : [];

  const years: number[] = selectedMake && selectedModel
    ? vehicles
        .filter((v) => v.make === selectedMake && v.model === selectedModel)
        .map((v) => v.year)
        .filter((y, i, arr) => arr.indexOf(y) === i)
        .sort((a, b) => b - a)
    : [];

  const handleMakeChange = useCallback((make: string) => {
    setSelectedMake(make);
    setSelectedModel("");
    setSelectedYear(null);
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model);
    setSelectedYear(null);
  }, []);

  function handleSubmit() {
    if (mode === "transit") {
      onNext("transit");
      return;
    }
    if (mode === "bike") {
      onNext("bike");
      return;
    }

    if (!selectedMake || !selectedModel || !selectedYear) return;

    const match = vehicles.find(
      (v) => v.make === selectedMake && v.model === selectedModel && v.year === selectedYear,
    );

    if (!match) return;

    onNext({
      make: match.make,
      model: match.model,
      year: match.year,
      fuel_type: match.fuel_type,
      l_per_100km: match.l_per_100km,
      kwh_per_100km: match.kwh_per_100km,
    });
  }

  const canSubmit =
    mode === "transit" ||
    mode === "bike" ||
    (mode === "car" && selectedMake && selectedModel && selectedYear);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">How do you get around?</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          This helps us calculate transportation costs for store trips.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setMode("car")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
            mode === "car"
              ? "border-eco-green bg-green-50 dark:bg-green-950/20"
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
          }`}
        >
          <span className="text-2xl">&#x1F697;</span>
          <span className="text-sm font-medium">Car</span>
        </button>
        <button
          onClick={() => setMode("transit")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
            mode === "transit"
              ? "border-eco-green bg-green-50 dark:bg-green-950/20"
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
          }`}
        >
          <span className="text-2xl">&#x1F68C;</span>
          <span className="text-sm font-medium">Transit</span>
        </button>
        <button
          onClick={() => setMode("bike")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
            mode === "bike"
              ? "border-eco-green bg-green-50 dark:bg-green-950/20"
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
          }`}
        >
          <span className="text-2xl">&#x1F6B2;</span>
          <span className="text-sm font-medium">Bike</span>
        </button>
      </div>

      {mode === "car" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="make" className="text-sm font-medium">Make</label>
            <select
              id="make"
              value={selectedMake}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-eco-green"
            >
              <option value="">Select make...</option>
              {makes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {selectedMake && (
            <div className="flex flex-col gap-2">
              <label htmlFor="model" className="text-sm font-medium">Model</label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                <option value="">Select model...</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}

          {selectedModel && (
            <div className="flex flex-col gap-2">
              <label htmlFor="year" className="text-sm font-medium">Year</label>
              <select
                id="year"
                value={selectedYear ?? ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                <option value="">Select year...</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {selectedYear && (() => {
            const match = vehicles.find(
              (v) => v.make === selectedMake && v.model === selectedModel && v.year === selectedYear,
            );
            if (!match) return null;
            return (
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Fuel consumption</p>
                <p className="mt-1 font-medium">
                  {match.fuel_type === "electric"
                    ? `${match.kwh_per_100km} kWh/100km`
                    : `${match.l_per_100km} L/100km`}
                  {match.fuel_type === "hybrid" && ` (hybrid)`}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-300 px-6 py-3 font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-eco-green px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
