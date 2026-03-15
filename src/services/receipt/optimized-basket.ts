import type {
  AnalyzedReceiptItem,
  OptimizedBasket,
} from "@/types/receipt";
import { mockSwapRecommendations } from "@/data/mock-receipt";

const USE_MOCK = !process.env.GEMINI_API_KEY;

export function calculateOptimizedBasket(
  analyzedItems: AnalyzedReceiptItem[],
): OptimizedBasket {
  // Use real analysis when API keys are available
  if (!USE_MOCK && analyzedItems.some((item) => item.sustainability !== null)) {
    return calculateOptimizedBasketReal(analyzedItems);
  }

  // Mock fallback
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

function calculateOptimizedBasketReal(
  analyzedItems: AnalyzedReceiptItem[],
): OptimizedBasket {
  const sorted = [...analyzedItems]
    .filter((item) => item.sustainability !== null)
    .sort(
      (a, b) =>
        (a.sustainability?.final_score ?? 100) -
        (b.sustainability?.final_score ?? 100),
    );

  const bottom5 = sorted.slice(0, 5);

  const swaps = bottom5.map((item) => {
    const score = item.sustainability?.final_score ?? 50;
    const improvement = Math.min(25, Math.round((100 - score) * 0.3));
    return {
      original: item.matched_product || item.raw_text,
      replacement: `Organic ${item.matched_product || item.raw_text}`,
      replacement_brand: "Organic Alternative",
      store: "Nearby Store",
      score_improvement: improvement,
      cost_difference: Math.round((item.price * 0.15 + 0.5) * 100) / 100,
    };
  });

  const currentTotalCost = analyzedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const additionalCost = swaps.reduce((sum, s) => sum + s.cost_difference, 0);

  let weightedScoreSum = 0;
  let weightSum = 0;
  for (const item of analyzedItems) {
    if (item.sustainability) {
      const weight = item.price * item.quantity;
      const swap = swaps.find((s) => s.original === (item.matched_product || item.raw_text));
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
  const totalImprovement = swaps.reduce((sum, s) => sum + s.score_improvement, 0);
  const externalitySavings = Math.round(currentExternalities * (totalImprovement / 500) * 100) / 100;

  return {
    swaps,
    new_total_score: newTotalScore,
    new_total_cost: Math.round((currentTotalCost + additionalCost) * 100) / 100,
    externality_savings: externalitySavings,
  };
}
