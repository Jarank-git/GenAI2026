import type {
  AnalyzedReceiptItem,
  OptimizedBasket,
} from "@/types/receipt";
import { mockSwapRecommendations } from "@/data/mock-receipt";

const USE_MOCK = true;

export function calculateOptimizedBasket(
  analyzedItems: AnalyzedReceiptItem[],
): OptimizedBasket {
  if (USE_MOCK) {
    const swaps = mockSwapRecommendations;

    const currentTotalCost = analyzedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const additionalCost = swaps.reduce((sum, s) => sum + s.cost_difference, 0);
    const newTotalCost = Math.round((currentTotalCost + additionalCost) * 100) / 100;

    let weightedScoreSum = 0;
    let weightSum = 0;
    for (const item of analyzedItems) {
      if (item.sustainability) {
        const weight = item.price * item.quantity;
        const swap = swaps.find(
          (s) => s.original === item.matched_product,
        );
        const adjustedScore = swap
          ? item.sustainability.final_score + swap.score_improvement
          : item.sustainability.final_score;
        weightedScoreSum += adjustedScore * weight;
        weightSum += weight;
      }
    }
    const newTotalScore = weightSum > 0 ? Math.round(weightedScoreSum / weightSum) : 0;

    const currentExternalities = analyzedItems.reduce(
      (sum, item) => sum + (item.externality?.externality_cost ?? 0),
      0,
    );
    const estimatedSavingsRatio = swaps.reduce(
      (sum, s) => sum + s.score_improvement,
      0,
    ) / 500;
    const externalitySavings =
      Math.round(currentExternalities * estimatedSavingsRatio * 100) / 100;

    return {
      swaps,
      new_total_score: newTotalScore,
      new_total_cost: newTotalCost,
      externality_savings: externalitySavings,
    };
  }

  const sorted = [...analyzedItems]
    .filter((item) => item.sustainability !== null)
    .sort(
      (a, b) =>
        (a.sustainability?.final_score ?? 100) -
        (b.sustainability?.final_score ?? 100),
    );

  const bottom5 = sorted.slice(0, 5);

  // In real mode, would query pricing pipeline for alternatives
  const swaps = bottom5.map((item) => ({
    original: item.matched_product || item.raw_text,
    replacement: `Eco-friendly ${item.matched_product || item.raw_text}`,
    replacement_brand: "Eco Brand",
    store: "Nearby Store",
    score_improvement: 20,
    cost_difference: 1.0,
  }));

  const currentTotalCost = analyzedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const additionalCost = swaps.reduce((sum, s) => sum + s.cost_difference, 0);

  return {
    swaps,
    new_total_score: 0,
    new_total_cost: Math.round((currentTotalCost + additionalCost) * 100) / 100,
    externality_savings: 0,
  };
}
