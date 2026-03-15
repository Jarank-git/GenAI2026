import type { PriceResult } from "@/types/pricing";
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

const STORE_SEARCH_URLS: Record<string, (q: string) => string> = {
  walmart: (q) => `https://www.walmart.ca/search?q=${encodeURIComponent(q)}`,
  metro: (q) => `https://www.metro.ca/en/search?filter=${encodeURIComponent(q)}`,
  sobeys: (q) => `https://www.sobeys.com/en/search/?search_query=${encodeURIComponent(q)}`,
  freshco: (q) => `https://www.freshco.com/search/?search-bar=${encodeURIComponent(q)}`,
  "food basics": (q) => `https://www.foodbasics.ca/search?filter=${encodeURIComponent(q)}`,
  "save-on-foods": (q) => `https://www.saveonfoods.com/sm/pickup/rsid/987/results?q=${encodeURIComponent(q)}`,
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
    const items: FlippItem[] = data?.items?.length ? data.items : data?.ecom_items ?? data ?? [];
    if (items.length === 0) return null;

    // Filter to target store, then rank by name similarity to the original product
    const storeItems = items.filter((item) =>
      item.merchant?.toLowerCase().includes(storeName.toLowerCase())
    );
    const candidates = storeItems.length > 0 ? storeItems : items;

    const item = findBestMatch(productName, candidates);
    if (!item) return null;

    const price = item.current_price ?? item.price ?? parseFlippPriceText(item.price_text);
    if (!price || price <= 0) return null;

    const banner = STORE_BANNER_MAP[storeName] ?? storeName.toLowerCase().replace(/\s+/g, "");
    const displayName = item.merchant
      ? item.merchant
      : STORE_DISPLAY_NAMES[storeName] ?? storeName;

    const searchUrl = STORE_SEARCH_URLS[storeName]?.(productName) ?? null;

    return {
      store_name: displayName,
      banner,
      price,
      unit_price: null,
      confidence: "web_estimate",
      source_url: searchUrl,
      distance_km: null,
      gas_cost: 0,
      out_of_pocket: price,
    };
  } catch {
    return null;
  }
}

function findBestMatch(productName: string, items: FlippItem[]): FlippItem | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  const queryWords = productName.toLowerCase().split(/\s+/);

  let bestItem = items[0];
  let bestScore = -1;

  for (const item of items) {
    const itemName = (item.name ?? "").toLowerCase();
    let score = 0;

    // Score by how many query words appear in the item name
    for (const word of queryWords) {
      if (word.length >= 3 && itemName.includes(word)) {
        score += word.length;
      }
    }

    // Penalize items with very different names (likely sub-products like "B-Ready")
    const itemWords = itemName.split(/\s+/);
    const extraWords = itemWords.filter(
      (w) => w.length >= 4 && !queryWords.some((qw) => w.includes(qw) || qw.includes(w))
    );
    score -= extraWords.length * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
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
  // Single search — do NOT append store name to query (kills results for non-Walmart stores)
  try {
    const url = `${FLIPP_SEARCH_URL}?locale=en-ca&postal_code=${encodeURIComponent(postalCode)}&q=${encodeURIComponent(productName)}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const ecomItems: FlippItem[] = data?.ecom_items ?? [];
    const flyerItems: FlippItem[] = data?.items ?? [];

    const results: PriceResult[] = [];
    const seenBanners = new Set<string>();

    // Process ecom items (have merchant info)
    for (const storeName of NON_LOBLAW_STORES) {
      const storeItems = ecomItems.filter((item) =>
        item.merchant?.toLowerCase().includes(storeName.toLowerCase())
      );
      if (storeItems.length === 0) continue;

      const best = findBestMatch(productName, storeItems);
      if (!best) continue;

      const price = best.current_price ?? best.price ?? parseFlippPriceText(best.price_text);
      if (!price || price <= 0) continue;

      const banner = STORE_BANNER_MAP[storeName] ?? storeName.toLowerCase().replace(/\s+/g, "");
      if (seenBanners.has(banner)) continue;
      seenBanners.add(banner);

      results.push({
        store_name: best.merchant ?? STORE_DISPLAY_NAMES[storeName] ?? storeName,
        banner,
        price,
        unit_price: null,
        confidence: "web_estimate",
        source_url: STORE_SEARCH_URLS[storeName]?.(productName) ?? null,
        distance_km: null,
        gas_cost: 0,
        out_of_pocket: price,
      });
    }

    // Also include flyer items with prices (unknown merchant, label as "Flyer Deal")
    if (flyerItems.length > 0) {
      const bestFlyer = findBestMatch(productName, flyerItems);
      if (bestFlyer) {
        const price = bestFlyer.current_price ?? bestFlyer.price ?? parseFlippPriceText(bestFlyer.price_text);
        if (price && price > 0 && !seenBanners.has("flyer")) {
          seenBanners.add("flyer");
          results.push({
            store_name: bestFlyer.merchant ?? "Flyer Deal",
            banner: "flyer",
            price,
            unit_price: null,
            confidence: "web_estimate",
            source_url: null,
            distance_km: null,
            gas_cost: 0,
            out_of_pocket: price,
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}
