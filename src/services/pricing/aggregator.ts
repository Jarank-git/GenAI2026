import type { PriceResult } from "@/types/pricing";

const CONFIDENCE_RANK: Record<string, number> = {
  verified: 3,
  web_estimate: 2,
  unavailable: 1,
};

export function aggregatePrices(
  layer1: PriceResult[],
  layer2: PriceResult[],
  layer3: PriceResult[]
): PriceResult[] {
  const allPrices = [...layer1, ...layer2, ...layer3];

  const deduped = new Map<string, PriceResult>();

  for (const price of allPrices) {
    const key = price.banner.toLowerCase();
    const existing = deduped.get(key);

    if (
      !existing ||
      (CONFIDENCE_RANK[price.confidence] ?? 0) >
        (CONFIDENCE_RANK[existing.confidence] ?? 0)
    ) {
      deduped.set(key, price);
    }
  }

  const results = Array.from(deduped.values());
  results.sort((a, b) => a.price - b.price);

  return results;
}
