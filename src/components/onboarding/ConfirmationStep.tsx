"use client";

import type { UserProfile, VehicleProfile } from "@/types/user-profile";

interface ConfirmationStepProps {
  profile: UserProfile;
  onConfirm: () => void;
  onBack: () => void;
}

const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario",
  AB: "Alberta",
  BC: "British Columbia",
  QC: "Quebec",
  MB: "Manitoba",
  SK: "Saskatchewan",
  NB: "New Brunswick",
  NS: "Nova Scotia",
  PE: "Prince Edward Island",
  NL: "Newfoundland and Labrador",
  NT: "Northwest Territories",
  YT: "Yukon",
  NU: "Nunavut",
};

function formatVehicle(vehicle: UserProfile["vehicle"]): string {
  if (vehicle === "transit") return "Public Transit";
  if (vehicle === "bike") return "Bicycle";
  const v = vehicle as VehicleProfile;
  return `${v.year} ${v.make} ${v.model} (${v.fuel_type})`;
}

export default function ConfirmationStep({ profile, onConfirm, onBack }: ConfirmationStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-8 w-8 text-eco-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Your EcoLens is calibrated</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Sustainability scores will be personalized to your location and circumstances.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Location</span>
          <span className="font-medium">
            {profile.city}, {PROVINCE_NAMES[profile.province] ?? profile.province}
          </span>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800" />
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Postal Code</span>
          <span className="font-medium">{profile.postal_code}</span>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800" />
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Transportation</span>
          <span className="font-medium">{formatVehicle(profile.vehicle)}</span>
        </div>
        {profile.household_size && (
          <>
            <div className="border-t border-zinc-100 dark:border-zinc-800" />
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Household Size</span>
              <span className="font-medium">{profile.household_size}</span>
            </div>
          </>
        )}
        {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
          <>
            <div className="border-t border-zinc-100 dark:border-zinc-800" />
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Dietary</span>
              <span className="font-medium">{profile.dietary_restrictions.join(", ")}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-300 px-6 py-3 font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-eco-green px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
        >
          Start Using EcoLens
        </button>
      </div>
    </div>
  );
}
