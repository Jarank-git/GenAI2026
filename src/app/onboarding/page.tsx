"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="page-container items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="text-display text-sm text-muted transition-colors hover:text-foreground">
            &larr; Back to home
          </Link>
          <h1 className="text-display mt-6 text-3xl sm:text-4xl">
            <em className="text-accent">Personalize</em> Your Lens
          </h1>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 w-12 rounded-full transition-all duration-500 ${
                  i <= stepIndex ? "bg-accent" : "bg-border"
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
          <div className="animate-fade-up flex flex-col gap-6">
            <div>
              <h2 className="text-editorial text-2xl text-foreground">A few more details</h2>
              <p className="mt-2 text-sm font-light text-muted">
                Optional — helps us give better recommendations.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="household" className="text-sm font-medium text-foreground">
                Household size
              </label>
              <select
                id="household"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-light text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Dietary preferences</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleDietary(option)}
                    className={`rounded-full border px-4 py-2 text-xs font-light tracking-wide transition-all ${
                      dietaryRestrictions.includes(option)
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-muted hover:border-accent/30"
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
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="btn-primary flex-1"
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
