import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import type { SustainabilityScore } from "@/types/scoring";
import { researchSustainability } from "@/services/scoring/gemini-research";
import { enrichWithOFF, calibrateWithOFF } from "@/services/scoring/off-enrichment";
import { scoreTransport } from "@/services/scoring/transport";
import { calculateBaseScore } from "@/services/scoring/base-calculator";
import { applyHyperlocalAdjustments } from "@/services/scoring/hyperlocal-adj";
import { interpretScore } from "@/services/scoring/interpreter";
import { buildHyperlocalContext } from "@/services/hyperlocal";

const scoreCache = new Map<string, { score: SustainabilityScore; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function scoreProduct(
  product: Product,
  userProfile: UserProfile,
): Promise<SustainabilityScore> {
  const cacheKey = `score:${product.product_id}:${userProfile.postal_code}`;
  const cached = scoreCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.score;
  }

  const [researchResult, offData] = await Promise.all([
    researchSustainability(product),
    enrichWithOFF(product),
  ]);

  let factors = { ...researchResult.factors };

  if (offData) {
    factors = calibrateWithOFF(factors, offData);
  }

  const transportScore = scoreTransport(
    researchResult.origin_country,
    researchResult.transport_mode,
    researchResult.transport_distance_km,
  );
  factors.transport = transportScore;

  const baseScore = calculateBaseScore(factors, product.category);

  const context = await buildHyperlocalContext(userProfile);

  const { finalScore, adjustments } = await applyHyperlocalAdjustments(
    baseScore === -1 ? 50 : baseScore,
    product,
    context,
  );

  const { label, color } = interpretScore(finalScore);

  const result: SustainabilityScore = {
    product_id: product.product_id,
    base_score: baseScore === -1 ? 50 : baseScore,
    final_score: finalScore,
    label,
    color,
    factors,
    adjustments,
  };

  scoreCache.set(cacheKey, { score: result, expiry: Date.now() + CACHE_TTL_MS });

  return result;
}
