/**
 * Externality pricing constants.
 * Carbon price follows Canada's federal schedule:
 * $110/tonne in 2026, rising $15/year to $170 by 2030.
 */

export const CARBON_PRICE_SCHEDULE: Record<number, number> = {
  2025: 95,
  2026: 110,
  2027: 125,
  2028: 140,
  2029: 155,
  2030: 170,
};

export function getCarbonPricePerTonne(year: number = new Date().getFullYear()): number {
  if (year in CARBON_PRICE_SCHEDULE) return CARBON_PRICE_SCHEDULE[year];
  if (year > 2030) return 170;
  return 95;
}

export const WATER_BASE_COST_PER_LITRE = 0.0001; // CAD

export const WATER_SCARCITY_MULTIPLIER: Record<string, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.5,
  very_high: 4.0,
};

// Cost per gram by plastic resin type (CAD)
export const PLASTIC_COST_PER_GRAM: Record<string, number> = {
  PET_1: 0.0008,
  HDPE_2: 0.0006,
  PVC_3: 0.0012,
  LDPE_4: 0.0007,
  PP_5: 0.0007,
  PS_6: 0.0010,
  OTHER_7: 0.0009,
  cardboard: 0.0002,
  glass: 0.0003,
  aluminum: 0.0005,
};

export const LANDFILL_MULTIPLIER = 2.5; // applied when not recyclable locally

// Land use cost per m² by commodity (CAD)
export const LAND_USE_COST_PER_M2: Record<string, number> = {
  beef: 0.015,
  palm_oil: 0.020,
  soy: 0.010,
  coffee: 0.012,
  cocoa: 0.014,
  cotton: 0.008,
  default: 0.005,
};
