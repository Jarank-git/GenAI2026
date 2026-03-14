import type { ReceiptItem, AnalyzedReceiptItem } from "@/types/receipt";
import type { Product, ProductCategory } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import { scoreProduct } from "@/orchestrators/scoring-pipeline";
import { calculateTotalExternality } from "@/orchestrators/externality-pipeline";
import { mockAnalyzedItems } from "@/data/mock-receipt";

const USE_MOCK = true;

function receiptItemToProduct(item: ReceiptItem, index: number): Product {
  return {
    product_id: `receipt-item-${index}`,
    product_name: item.matched_product || item.raw_text,
    brand: item.brand || "Unknown",
    category: (item.category as ProductCategory) || "food_beverage",
    weight_volume: "",
    barcode: null,
    image_url: null,
    confidence: item.match_confidence === "high" ? 0.9 : item.match_confidence === "medium" ? 0.7 : 0.5,
    open_food_facts_match: false,
  };
}

export async function analyzeReceiptItems(
  items: ReceiptItem[],
  userProfile: UserProfile,
): Promise<AnalyzedReceiptItem[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockAnalyzedItems;
  }

  const results = await Promise.all(
    items.map(async (item, index) => {
      const product = receiptItemToProduct(item, index);

      try {
        const [sustainability, externality] = await Promise.all([
          scoreProduct(product, userProfile),
          calculateTotalExternality(product, userProfile, item.price),
        ]);

        return {
          ...item,
          sustainability,
          externality,
        } as AnalyzedReceiptItem;
      } catch {
        return {
          ...item,
          sustainability: null,
          externality: null,
        } as AnalyzedReceiptItem;
      }
    }),
  );

  return results;
}
