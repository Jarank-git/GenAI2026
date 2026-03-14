import type { PriceResult } from "@/types/pricing";
import { findMockPriceByName } from "@/data/mock-prices";

const LOBLAW_BANNERS = ["loblaws", "nofrills", "superstore"] as const;

const PC_EXPRESS_BASE_URL = "https://api.pcexpress.ca/product-facade/v3/products/search";

const BANNER_DISPLAY_NAMES: Record<string, string> = {
  loblaws: "Loblaws",
  nofrills: "No Frills",
  superstore: "Real Canadian Superstore",
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

  try {
    const response = await fetch(PC_EXPRESS_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Apikey": apiKey,
        "Site-Banner": banner,
      },
      body: JSON.stringify({
        query: productName,
        pagination: { from: 0, size: 1 },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const product = data?.results?.[0];
    if (!product) return null;

    return {
      store_name: BANNER_DISPLAY_NAMES[banner] ?? banner,
      banner,
      price: product.price ?? 0,
      unit_price: product.unitPrice ?? null,
      confidence: "verified",
      source_url: null,
      distance_km: null,
      gas_cost: 0,
      out_of_pocket: product.price ?? 0,
    };
  } catch {
    return null;
  }
}

export async function queryAllBanners(
  productName: string
): Promise<PriceResult[]> {
  const results = await Promise.all(
    LOBLAW_BANNERS.map((banner) => queryPCExpress(productName, banner))
  );

  return results.filter((r): r is PriceResult => r !== null);
}
