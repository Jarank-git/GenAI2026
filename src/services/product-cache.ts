import type { Product } from "@/types/product";

interface CacheEntry {
  product: Product;
  timestamp: number;
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const cache = new Map<string, CacheEntry>();

export function getCachedProduct(key: string): Product | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.product;
}

export function cacheProduct(key: string, product: Product): void {
  cache.set(key, { product, timestamp: Date.now() });
}
