import { getCarbonPricePerTonne } from "@/config/externality-pricing";

export function calculateCarbonCost(kgCO2e: number): {
  cost: number;
  kg_co2e: number;
} {
  const pricePerKg = getCarbonPricePerTonne() / 1000;
  const cost = Math.round(kgCO2e * pricePerKg * 100) / 100;
  return { cost, kg_co2e: kgCO2e };
}
