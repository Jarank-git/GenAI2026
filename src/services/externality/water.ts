import {
  WATER_BASE_COST_PER_LITRE,
  WATER_SCARCITY_MULTIPLIER,
} from "@/config/externality-pricing";
import type { WaterStressLevel } from "@/types/user-profile";

export function calculateWaterCost(
  litres: number,
  waterStressLevel: WaterStressLevel,
): { cost: number; litres: number; scarcity_multiplier: number } {
  const multiplier = WATER_SCARCITY_MULTIPLIER[waterStressLevel] ?? 1.0;
  const cost =
    Math.round(litres * WATER_BASE_COST_PER_LITRE * multiplier * 100) / 100;
  return { cost, litres, scarcity_multiplier: multiplier };
}
