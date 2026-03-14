export interface UserProfile {
  postal_code: string;
  province: string;
  city: string;
  coordinates: { lat: number; lng: number };
  vehicle: VehicleProfile | "transit" | "bike";
  household_size?: number;
  dietary_restrictions?: string[];
}

export interface VehicleProfile {
  make: string;
  model: string;
  year: number;
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid";
  l_per_100km: number;
  kwh_per_100km?: number; // for EVs/hybrids
}

export interface HyperlocalContext {
  grid_intensity: { gco2_per_kwh: number; generation_mix: Record<string, number> };
  water_stress: { index: number; level: WaterStressLevel; basin: string };
  recycling: { accepted_materials: string[]; source: string };
  seasonal_produce: string[];
  gas_price: { price_per_litre: number; source: string; last_updated: string };
}

export type WaterStressLevel = "low" | "medium" | "high" | "very_high";
