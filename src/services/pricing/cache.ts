import type { PriceResult } from "@/types/pricing";

interface CacheEntry {
  prices: PriceResult[];
  timestamp: number;
  ttl_ms: number;
}

const LAYER_1_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LAYER_2_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

const cache = new Map<string, CacheEntry>();

export function getCachedPrices(productId: string): PriceResult[] | null {
  const entry = cache.get(productId);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > entry.ttl_ms) {
    cache.delete(productId);
    return null;
  }

  return entry.prices;
}

export function cachePrices(
  productId: string,
  prices: PriceResult[],
  layer: 1 | 2
): void {
  const ttl_ms = layer === 1 ? LAYER_1_TTL_MS : LAYER_2_TTL_MS;
  cache.set(productId, { prices, timestamp: Date.now(), ttl_ms });
}
