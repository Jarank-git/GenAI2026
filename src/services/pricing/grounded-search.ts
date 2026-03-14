import type { PriceResult } from "@/types/pricing";
import { findMockPriceByName } from "@/data/mock-prices";

const NON_LOBLAW_STORES = ["walmart", "metro", "sobeys"] as const;

function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY;
}

export async function queryGroundedPrice(
  productName: string,
  storeName: string,
  _city: string
): Promise<PriceResult | null> {
  if (isMockMode()) {
    return queryGroundedPriceMock(productName, storeName);
  }

  return queryGroundedPriceReal(productName, storeName, _city);
}

async function queryGroundedPriceMock(
  productName: string,
  banner: string
): Promise<PriceResult | null> {
  const entry = findMockPriceByName(productName);
  if (!entry) return null;

  const storeEntry = entry.stores.find((s) => s.banner === banner);
  if (!storeEntry) return null;

  return {
    store_name: storeEntry.store_name,
    banner: storeEntry.banner,
    price: storeEntry.price,
    unit_price: storeEntry.unit_price,
    confidence: "web_estimate",
    source_url: storeEntry.source_url,
    distance_km: null,
    gas_cost: 0,
    out_of_pocket: storeEntry.price,
  };
}

async function queryGroundedPriceReal(
  productName: string,
  storeName: string,
  city: string
): Promise<PriceResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Find the current retail price for "${productName}" at ${storeName} in ${city}, Canada. Return ONLY factual pricing from current web sources. If you cannot find a verified price, say "not found". Do NOT guess or use training data for prices.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search_retrieval: {} }],
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const sourceUrl = data?.candidates?.[0]?.groundingMetadata?.webSearchQueries?.[0] ?? null;

    const priceMatch = text.match(/\$(\d+\.?\d*)/);
    if (!priceMatch) return null;

    const price = parseFloat(priceMatch[1]);
    if (isNaN(price) || price <= 0) return null;

    return {
      store_name: storeName.charAt(0).toUpperCase() + storeName.slice(1),
      banner: storeName.toLowerCase(),
      price,
      unit_price: null,
      confidence: "web_estimate",
      source_url: sourceUrl,
      distance_km: null,
      gas_cost: 0,
      out_of_pocket: price,
    };
  } catch {
    return null;
  }
}

export async function queryNonLoblawStores(
  productName: string,
  city: string
): Promise<PriceResult[]> {
  const results = await Promise.all(
    NON_LOBLAW_STORES.map((store) =>
      queryGroundedPrice(productName, store, city)
    )
  );

  return results.filter((r): r is PriceResult => r !== null);
}
