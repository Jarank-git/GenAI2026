"use client";

import { useState } from "react";

interface PostalCodeStepProps {
  onNext: (data: { postalCode: string; province: string; city: string; lat: number; lng: number }) => void;
}

const POSTAL_PREFIX_MAP: Record<string, { province: string; city: string; lat: number; lng: number }> = {
  M: { province: "ON", city: "Toronto", lat: 43.6532, lng: -79.3832 },
  L: { province: "ON", city: "Mississauga", lat: 43.59, lng: -79.65 },
  K: { province: "ON", city: "Ottawa", lat: 45.4215, lng: -75.6972 },
  N: { province: "ON", city: "London", lat: 43.0096, lng: -81.2737 },
  T: { province: "AB", city: "Calgary", lat: 51.0447, lng: -114.0719 },
  V: { province: "BC", city: "Vancouver", lat: 49.2827, lng: -123.1207 },
  H: { province: "QC", city: "Montreal", lat: 45.5017, lng: -73.5673 },
  G: { province: "QC", city: "Quebec City", lat: 46.8139, lng: -71.208 },
  R: { province: "MB", city: "Winnipeg", lat: 49.8951, lng: -97.1384 },
  S: { province: "SK", city: "Saskatoon", lat: 52.1332, lng: -106.67 },
  E: { province: "NB", city: "Moncton", lat: 46.1351, lng: -66.6428 },
  B: { province: "NS", city: "Halifax", lat: 44.6488, lng: -63.5752 },
  C: { province: "PE", city: "Charlottetown", lat: 46.2382, lng: -63.1311 },
  A: { province: "NL", city: "St. John's", lat: 47.5615, lng: -52.7126 },
  P: { province: "ON", city: "Sudbury", lat: 46.4917, lng: -80.993 },
  J: { province: "QC", city: "Longueuil", lat: 45.5, lng: -73.4 },
};

const POSTAL_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario", AB: "Alberta", BC: "British Columbia", QC: "Quebec",
  MB: "Manitoba", SK: "Saskatchewan", NB: "New Brunswick", NS: "Nova Scotia",
  PE: "Prince Edward Island", NL: "Newfoundland and Labrador",
};

export default function PostalCodeStep({ onNext }: PostalCodeStepProps) {
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [resolved, setResolved] = useState<{ province: string; city: string; lat: number; lng: number } | null>(null);

  function handleChange(value: string) {
    const upper = value.toUpperCase();
    setPostalCode(upper);
    setError("");
    if (upper.length >= 3) {
      const match = POSTAL_PREFIX_MAP[upper.charAt(0)];
      setResolved(match ?? null);
    } else {
      setResolved(null);
    }
  }

  function handleSubmit() {
    const cleaned = postalCode.trim();
    if (!POSTAL_REGEX.test(cleaned)) {
      setError("Enter a valid Canadian postal code — for example, M5V 2T6");
      return;
    }
    const match = POSTAL_PREFIX_MAP[cleaned.charAt(0)];
    if (!match) {
      setError("We could not determine your location from this postal code");
      return;
    }
    onNext({ postalCode: cleaned, province: match.province, city: match.city, lat: match.lat, lng: match.lng });
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div>
        <h2 className="text-editorial text-2xl text-foreground">Where are you located?</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-muted">
          Your postal code personalizes sustainability scores to your region — grid emissions, water stress, and recycling programs all vary across Canada.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="postal-code" className="text-xs font-medium uppercase tracking-widest text-muted">
          Canadian Postal Code
        </label>
        <input
          id="postal-code"
          type="text"
          placeholder="M5V 2T6"
          maxLength={7}
          value={postalCode}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="onboarding-input"
          autoComplete="postal-code"
          spellCheck={false}
        />
        {error && (
          <p className="text-xs text-eco-red mt-1" role="alert">
            {error}
          </p>
        )}
      </div>

      {resolved && (
        <div className="border-t border-border pt-5">
          <p className="text-xs uppercase tracking-widest text-muted">Detected location</p>
          <p className="mt-2 text-editorial text-xl text-foreground">
            {resolved.city}, {PROVINCE_NAMES[resolved.province] ?? resolved.province}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!postalCode.trim()}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to transport
      </button>
    </div>
  );
}
