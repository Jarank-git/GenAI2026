import type { ProductCategory } from "@/types/product";
import type { FactorScores } from "@/types/scoring";
import {
  CATEGORY_WEIGHTS,
  DEFAULT_CATEGORY,
} from "@/config/category-weights";

export function calculateBaseScore(
  factors: FactorScores,
  category: ProductCategory,
): number {
  const weights = CATEGORY_WEIGHTS[category] ?? CATEGORY_WEIGHTS[DEFAULT_CATEGORY];

  const keys: (keyof FactorScores)[] = [
    "transport",
    "packaging",
    "certifications",
    "brand_ethics",
    "production",
    "end_of_life",
  ];

  for (const key of keys) {
    if (factors[key] === undefined || factors[key] === null || isNaN(factors[key])) {
      return -1;
    }
  }

  let score = 0;
  for (const key of keys) {
    score += (factors[key] * weights[key]) / 100;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
