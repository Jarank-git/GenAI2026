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
    ? Array.from(new Set(vehicles.filter((v) => v.make === selectedMake).map((v) => v.model))).sort()
    : [];
  const years =
    selectedMake && selectedModel
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
    if (mode === "transit") { onNext("transit"); return; }
    if (mode === "bike") { onNext("bike"); return; }
    if (!selectedMake || !selectedModel || !selectedYear) return;
    const match = vehicles.find(
      (v) => v.make === selectedMake && v.model === selectedModel && v.year === selectedYear,
    );
    if (!match) return;
    onNext({ make: match.make, model: match.model, year: match.year, fuel_type: match.fuel_type, l_per_100km: match.l_per_100km, kwh_per_100km: match.kwh_per_100km });
  }

  const canSubmit =
    mode === "transit" || mode === "bike" ||
    (mode === "car" && selectedMake && selectedModel && selectedYear);

  const vehicleMatch =
    selectedYear
      ? vehicles.find((v) => v.make === selectedMake && v.model === selectedModel && v.year === selectedYear)
      : null;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div>
        <h2 className="text-editorial text-2xl text-foreground">How do you get around?</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-muted">
          This is used to calculate the gas cost of driving to different stores.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["car", "transit", "bike"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`mode-btn${mode === m ? " mode-btn-active" : ""}`}
          >
            {m === "car" ? "Car" : m === "transit" ? "Transit" : "Bike"}
          </button>
        ))}
      </div>

      {mode === "car" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="make" className="text-xs font-medium uppercase tracking-widest text-muted">Make</label>
            <select
              id="make"
              value={selectedMake}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="form-select"
            >
              <option value="">Select make</option>
              {makes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {selectedMake && (
            <div className="flex flex-col gap-2">
              <label htmlFor="model" className="text-xs font-medium uppercase tracking-widest text-muted">Model</label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="form-select"
              >
                <option value="">Select model</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}

          {selectedModel && (
            <div className="flex flex-col gap-2">
              <label htmlFor="year" className="text-xs font-medium uppercase tracking-widest text-muted">Year</label>
              <select
                id="year"
                value={selectedYear ?? ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-select"
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {vehicleMatch && (
            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-widest text-muted">Fuel consumption</p>
              <p className="mt-2 text-editorial text-lg text-foreground">
                {vehicleMatch.fuel_type === "electric"
                  ? `${vehicleMatch.kwh_per_100km} kWh/100km`
                  : `${vehicleMatch.l_per_100km} L/100km`}
                {vehicleMatch.fuel_type === "hybrid" && (
                  <span className="ml-2 text-sm font-light text-muted">(hybrid)</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {(mode === "transit" || mode === "bike") && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-light text-muted">
            {mode === "transit"
              ? "Gas costs will not apply to your calculations."
              : "No fuel costs. Your externality scores will reflect this."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to details
        </button>
      </div>
    </div>
  );
}
