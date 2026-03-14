import type {
  ParsedReceipt,
  AnalyzedReceiptItem,
  SustainabilityReceipt,
} from "@/types/receipt";

export function generateSustainabilityReceipt(
  receipt: ParsedReceipt,
  analyzedItems: AnalyzedReceiptItem[],
): SustainabilityReceipt {
  const totalSpent = analyzedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const totalExternalities = analyzedItems.reduce((sum, item) => {
    const ext = item.externality?.externality_cost ?? 0;
    return sum + ext;
  }, 0);

  const totalCostWithExternalities =
    Math.round((totalSpent + totalExternalities) * 100) / 100;

  let weightedScoreSum = 0;
  let weightSum = 0;
  for (const item of analyzedItems) {
    if (item.sustainability) {
      const weight = item.price * item.quantity;
      weightedScoreSum += item.sustainability.final_score * weight;
      weightSum += weight;
    }
  }
  const overallScore = weightSum > 0 ? Math.round(weightedScoreSum / weightSum) : 0;

  const sorted = [...analyzedItems].sort((a, b) => {
    const aScore = a.sustainability?.final_score ?? 100;
    const bScore = b.sustainability?.final_score ?? 100;
    return aScore - bScore;
  });

  return {
    receipt,
    analyzed_items: sorted,
    total_spent: Math.round(totalSpent * 100) / 100,
    total_cost_with_externalities: totalCostWithExternalities,
    overall_score: overallScore,
    optimized_basket: null,
  };
}
