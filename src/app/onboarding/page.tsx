"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, VehicleProfile } from "@/types/user-profile";
import { saveProfile } from "@/lib/profile-storage";
import PostalCodeStep from "@/components/onboarding/PostalCodeStep";
import VehicleStep from "@/components/onboarding/VehicleStep";
import ConfirmationStep from "@/components/onboarding/ConfirmationStep";

type Step = "postal" | "vehicle" | "details" | "confirm";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Halal",
  "Kosher",
  "Organic preference",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("postal");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [vehicle, setVehicle] = useState<VehicleProfile | "transit" | "bike">("transit");
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  function handlePostalNext(data: { postalCode: string; province: string; city: string; lat: number; lng: number }) {
    setPostalCode(data.postalCode);
    setProvince(data.province);
    setCity(data.city);
    setCoordinates({ lat: data.lat, lng: data.lng });
    setStep("vehicle");
  }

  function handleVehicleNext(v: VehicleProfile | "transit" | "bike") {
    setVehicle(v);
    setStep("details");
  }

  function toggleDietary(option: string) {
    setDietaryRestrictions((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option],
    );
  }

  function buildProfile(): UserProfile {
    return {
      postal_code: postalCode,
      province,
      city,
      coordinates,
      vehicle,
      household_size: householdSize,
      dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
    };
  }

  function handleConfirm() {
    const profile = buildProfile();
    saveProfile(profile);
    router.push("/");
  }

  const stepIndex = ["postal", "vehicle", "details", "confirm"].indexOf(step);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">EcoLens Setup</h1>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-eco-green" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {step === "postal" && <PostalCodeStep onNext={handlePostalNext} />}

        {step === "vehicle" && (
          <VehicleStep
            onNext={handleVehicleNext}
            onBack={() => setStep("postal")}
          />
        )}

        {step === "details" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold">A few more details</h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                Optional — helps us give better recommendations.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="household" className="text-sm font-medium">
                Household size
              </label>
              <select
                id="household"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Dietary preferences</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleDietary(option)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      dietaryRestrictions.includes(option)
                        ? "border-eco-green bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                        : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("vehicle")}
                className="flex-1 rounded-lg border border-zinc-300 px-6 py-3 font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 rounded-lg bg-eco-green px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <ConfirmationStep
            profile={buildProfile()}
            onConfirm={handleConfirm}
            onBack={() => setStep("details")}
          />
        )}
      </div>
    </div>
  );
}
