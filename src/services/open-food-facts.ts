import type { Product, ProductCategory } from "@/types/product";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "EcoLens/1.0 (https://ecolens.dev)";

function mapCategory(offCategories: string): ProductCategory {
  const lower = offCategories.toLowerCase();
  if (
    lower.includes("food") ||
    lower.includes("beverage") ||
    lower.includes("dairy") ||
    lower.includes("meat") ||
    lower.includes("snack") ||
    lower.includes("cereal") ||
    lower.includes("pasta") ||
    lower.includes("sauce") ||
    lower.includes("drink")
  ) {
    return "food_beverage";
  }
  if (lower.includes("clean") || lower.includes("detergent")) {
    return "cleaning";
  }
  if (
    lower.includes("cosmetic") ||
    lower.includes("personal") ||
    lower.includes("hygiene") ||
    lower.includes("beauty")
  ) {
    return "personal_care";
  }
  return "food_beverage";
}

export async function lookupByBarcode(
  barcode: string
): Promise<Product | null> {
  try {
    const res = await fetch(`${OFF_API_BASE}/${barcode}.json`, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const productName =
      p.product_name || p.product_name_en || p.product_name_fr || "Unknown";
    const brand = p.brands || "Unknown";
    const quantity = p.quantity || p.product_quantity || "";
    const categories = p.categories || "";

    return {
      product_id: `off-${barcode}`,
      product_name: productName,
      brand: brand.split(",")[0].trim(),
      category: mapCategory(categories),
      weight_volume: quantity,
      barcode,
      image_url: p.image_url || p.image_front_url || null,
      confidence: 0.95,
      open_food_facts_match: true,
    };
  } catch {
    return null;
  }
}
