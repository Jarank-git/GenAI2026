import type { PriceResult } from "@/types/pricing";
import { findMockPriceByName } from "@/data/mock-prices";

const FLIPP_SEARCH_URL =
  "https://backflipp.wishabi.com/flipp/items/search";

const NON_LOBLAW_STORES = ["walmart", "metro", "sobeys", "freshco", "food basics", "save-on-foods"] as const;

const STORE_BANNER_MAP: Record<string, string> = {
  walmart: "walmart",
  metro: "metro",
  sobeys: "sobeys",
  freshco: "freshco",
  "food basics": "foodbasics",
  "save-on-foods": "saveonfoods",
};

const STORE_DISPLAY_NAMES: Record<string, string> = {
  walmart: "Walmart",
  metro: "Metro",
  sobeys: "Sobeys",
  freshco: "FreshCo",
  "food basics": "Food Basics",
  "save-on-foods": "Save-On-Foods",
};

interface FlippItem {
  name?: string;
  price?: number;
  current_price?: number | null;
  pre_price_text?: string;
  price_text?: string;
  merchant?: string;
  flyer_item_id?: number;
  valid_from?: string;
  valid_to?: string;
}

export async function queryFlippPrice(
  productName: string,
  storeName: string,
  postalCode: string = "M5V 1J2"
): Promise<PriceResult | null> {
  try {
    const query = `${productName} ${storeName}`;
    const url = `${FLIPP_SEARCH_URL}?locale=en-ca&postal_code=${encodeURIComponent(postalCode)}&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const items: FlippItem[] = data?.items ?? data ?? [];

    // Find best match — item from the target store
    const storeMatch = items.find((item) =>
      item.merchant?.toLowerCase().includes(storeName.toLowerCase())
    );

    const item = storeMatch ?? items[0];
    if (!item) return null;

    const price = item.current_price ?? item.price ?? parseFlippPriceText(item.price_text);
    if (!price || price <= 0) return null;

    const banner = STORE_BANNER_MAP[storeName] ?? storeName.toLowerCase().replace(/\s+/g, "");
    const displayName = item.merchant
      ? item.merchant
      : STORE_DISPLAY_NAMES[storeName] ?? storeName;

    return {
      store_name: displayName,
      banner,
      price,
      unit_price: null,
      confidence: "web_estimate",
      source_url: null,
      distance_km: null,
      gas_cost: 0,
      out_of_pocket: price,
    };
  } catch {
    return null;
  }
}

function parseFlippPriceText(text?: string): number | null {
  if (!text) return null;
  const match = text.match(/\$?(\d+\.?\d*)/);
  if (!match) return null;
  const price = parseFloat(match[1]);
  return isNaN(price) || price <= 0 ? null : price;
}

export async function queryNonLoblawStores(
  productName: string,
  _city: string,
  postalCode: string = "M5V 1J2"
): Promise<PriceResult[]> {
  // If no mock mode check needed — Flipp has no API key requirement
  const results = await Promise.all(
    NON_LOBLAW_STORES.map((store) =>
      queryFlippPrice(productName, store, postalCode)
    )
  );

  return results.filter((r): r is PriceResult => r !== null);
}
