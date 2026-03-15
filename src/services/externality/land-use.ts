import { LAND_USE_COST_PER_M2 } from "@/config/externality-pricing";

export function calculateLandUseCost(
  m2: number,
  commodity: string,
): { cost: number; m2: number } {
  const costPerM2 =
    LAND_USE_COST_PER_M2[commodity] ?? LAND_USE_COST_PER_M2["default"];
  const cost = Math.round(m2 * costPerM2 * 100) / 100;
  return { cost, m2 };
}

export function calculateEutrophicationCost(
  index: number,
): { cost: number; index: number } {
  const cost = Math.round(index * 0.02 * 100) / 100;
  return { cost, index };
}
