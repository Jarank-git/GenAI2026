import type { PriceResult } from "@/types/pricing";
import { findMockPriceByName } from "@/data/mock-prices";

const LOBLAW_BANNERS = ["loblaw", "nofrills", "superstore"] as const;

const PC_EXPRESS_BFF_URL =
  "https://api.pcexpress.ca/pcx-bff/api/v1/products/search";

// Default store ID (Toronto Loblaws). In production, resolve from user's postal code.
const DEFAULT_STORE_ID = "1032";

const BANNER_DISPLAY_NAMES: Record<string, string> = {
  loblaw: "Loblaws",
  nofrills: "No Frills",
  superstore: "Real Canadian Superstore",
};

const BANNER_ORIGINS: Record<string, string> = {
  loblaw: "https://www.loblaws.ca",
  nofrills: "https://www.nofrills.ca",
  superstore: "https://www.realcanadiansuperstore.ca",
};

function isMockMode(): boolean {
  return !process.env.PC_EXPRESS_API_KEY;
}

export async function queryPCExpress(
  productName: string,
  banner: string
): Promise<PriceResult | null> {
  if (isMockMode()) {
    return queryPCExpressMock(productName, banner);
  }

  return queryPCExpressReal(productName, banner);
}

async function queryPCExpressMock(
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
    confidence: "verified",
    source_url: null,
    distance_km: null,
    gas_cost: 0,
    out_of_pocket: storeEntry.price,
  };
}

async function queryPCExpressReal(
  productName: string,
  banner: string
): Promise<PriceResult | null> {
  const apiKey = process.env.PC_EXPRESS_API_KEY;
  if (!apiKey) return null;

  const origin = BANNER_ORIGINS[banner] ?? "https://www.loblaws.ca";

  try {
    const response = await fetch(PC_EXPRESS_BFF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-apikey": apiKey,
        "site-banner": banner,
        basesiteid: banner,
        "business-user-agent": "PCXWEB",
        "x-application-type": "web",
        "x-channel": "web",
        "x-loblaw-tenant-id": "ONLINE_GROCERIES",
        Accept: "application/json, text/plain, */*",
        Origin: origin,
        Referer: `${origin}/`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        term: productName,
        pagination: { from: 0, size: 5 },
        banner,
        lang: "en",
        pickupType: "STORE",
        storeId: DEFAULT_STORE_ID,
        offerType: "ALL",
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.errors) return null;

    const results = data?.results ?? [];
    if (results.length === 0) return null;

    // Find best match by product name similarity
    const best = findBestPCExpressMatch(productName, results);
    if (!best) return null;

    const rawPrice = best.prices?.price;
    const price: number =
      (typeof rawPrice === "object" ? rawPrice?.value : rawPrice) ?? 0;

    const unitPrice =
      best.prices?.comparisonPrices?.[0]?.value ?? null;

    if (price <= 0) return null;

    return {
      store_name: BANNER_DISPLAY_NAMES[banner] ?? banner,
      banner,
      price,
      unit_price: unitPrice,
      confidence: "verified",
      source_url: best.link ? `${origin}${best.link}` : null,
      distance_km: null,
      gas_cost: 0,
      out_of_pocket: price,
    };
  } catch {
    return null;
  }
}

interface PCExpressProduct {
  name?: string;
  brand?: string;
  link?: string;
  packageSize?: string;
  prices?: {
    price?: { value?: number };
    comparisonPrices?: Array<{ value?: number }>;
  };
}

function findBestPCExpressMatch(
  productName: string,
  results: PCExpressProduct[]
): PCExpressProduct | null {
  if (results.length === 0) return null;
  if (results.length === 1) return results[0];

  const queryWords = productName.toLowerCase().split(/\s+/);

  let bestItem = results[0];
  let bestScore = -1;

  for (const item of results) {
    const itemName = (item.name ?? "").toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      if (word.length >= 3 && itemName.includes(word)) {
        score += word.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

export async function queryAllBanners(
  productName: string
): Promise<PriceResult[]> {
  const results = await Promise.all(
    LOBLAW_BANNERS.map((banner) => queryPCExpress(productName, banner))
  );

  return results.filter((r): r is PriceResult => r !== null);
}
