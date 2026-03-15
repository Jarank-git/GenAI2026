"use client";

import type { UserProfile, VehicleProfile } from "@/types/user-profile";

interface ConfirmationStepProps {
  profile: UserProfile;
  onConfirm: () => void;
  onBack: () => void;
}

const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario", AB: "Alberta", BC: "British Columbia", QC: "Quebec",
  MB: "Manitoba", SK: "Saskatchewan", NB: "New Brunswick", NS: "Nova Scotia",
  PE: "Prince Edward Island", NL: "Newfoundland and Labrador",
  NT: "Northwest Territories", YT: "Yukon", NU: "Nunavut",
};

function formatVehicle(vehicle: UserProfile["vehicle"]): string {
  if (vehicle === "transit") return "Public Transit";
  if (vehicle === "bike") return "Bicycle";
  const v = vehicle as VehicleProfile;
  return `${v.year} ${v.make} ${v.model} (${v.fuel_type})`;
}

export default function ConfirmationStep({ profile, onConfirm, onBack }: ConfirmationStepProps) {
  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div>
        <h2 className="text-editorial text-2xl text-foreground">Your EcoLens is calibrated</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-muted">
          Every sustainability score and cost you see will be personalized to your location and circumstances.
        </p>
      </div>

      <div className="border-t border-border">
        <div className="profile-row">
          <span className="text-xs uppercase tracking-widest text-muted">Location</span>
          <span className="text-sm font-medium text-foreground">
            {profile.city}, {PROVINCE_NAMES[profile.province] ?? profile.province}
          </span>
        </div>
        <div className="profile-row">
          <span className="text-xs uppercase tracking-widest text-muted">Postal Code</span>
          <span className="text-sm font-medium text-foreground">{profile.postal_code}</span>
        </div>
        <div className="profile-row">
          <span className="text-xs uppercase tracking-widest text-muted">Transport</span>
          <span className="text-sm font-medium text-foreground">{formatVehicle(profile.vehicle)}</span>
        </div>
        {profile.household_size && (
          <div className="profile-row">
            <span className="text-xs uppercase tracking-widest text-muted">Household</span>
            <span className="text-sm font-medium text-foreground">
              {profile.household_size} {profile.household_size === 1 ? "person" : "people"}
            </span>
          </div>
        )}
        {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
          <div className="profile-row">
            <span className="text-xs uppercase tracking-widest text-muted">Dietary</span>
            <span className="text-sm font-medium text-foreground">
              {profile.dietary_restrictions.join(", ")}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">
          Back
        </button>
        <button onClick={onConfirm} className="btn-primary flex-1">
          Save and start scanning
        </button>
      </div>
    </div>
  );
}
