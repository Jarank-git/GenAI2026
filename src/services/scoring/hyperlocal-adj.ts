import type { Product } from "@/types/product";
import type { HyperlocalContext } from "@/types/user-profile";
import type { HyperlocalAdjustment } from "@/types/scoring";
import { calculateAdjustments } from "@/services/hyperlocal/adjustments";

export async function applyHyperlocalAdjustments(
  baseScore: number,
  product: Product,
  context: HyperlocalContext,
): Promise<{ finalScore: number; adjustments: HyperlocalAdjustment[] }> {
  const adjustments = await calculateAdjustments(product, context);

  const totalPenalty = adjustments.reduce(
    (sum, adj) => sum + adj.penalty_points,
    0,
  );

  const finalScore = Math.max(0, Math.min(100, baseScore + totalPenalty));

  return { finalScore, adjustments };
}
