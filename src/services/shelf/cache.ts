import type { AnalyzedShelfProduct } from "@/types/shelf";

interface CacheEntry {
  product: AnalyzedShelfProduct;
  timestamp: number;
}

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, CacheEntry>();

function buildKey(productId: string, postalCode: string): string {
  return `shelf:${productId}:${postalCode}`;
}

export function getCachedShelfResult(
  productId: string,
  postalCode: string
): AnalyzedShelfProduct | null {
  const key = buildKey(productId, postalCode);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.product;
}

export function cacheShelfResult(
  product: AnalyzedShelfProduct,
  postalCode: string
): void {
  const key = buildKey(product.product.product_id, postalCode);
  cache.set(key, { product, timestamp: Date.now() });
}
