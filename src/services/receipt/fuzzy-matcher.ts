import type { ReceiptItem } from "@/types/receipt";
import { mockMatchedItems } from "@/data/mock-receipt";

const USE_MOCK = true;

// Common Canadian grocery abbreviation patterns
// "NN" = No Name, "PC" = President's Choice, "BM" = Blue Menu
// "WHL" = Whole, "WHT" = Wheat/White, "BRD" = Bread
// "FR RNG" = Free Range, "LRG" = Large
// "BNLS" = Boneless, "SHRD" = Shredded
// "BW" = Body Wash, "LIQ" = Liquid
// "CKN" = Chicken, "NDLE" = Noodle
// "ORG" = Organic, "UNSLTED" = Unsalted
// "GV" = Great Value, "EQ" = Equate

export async function matchReceiptItems(
  items: Array<{ raw_text: string; price: number; quantity: number }>,
  storeContext: { name: string; banner: string },
): Promise<ReceiptItem[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return items.map((item, index) => {
      const mockItem = mockMatchedItems[index];
      if (mockItem && mockItem.raw_text === item.raw_text) {
        return { ...mockItem };
      }
      return {
        ...item,
        matched_product: item.raw_text,
        brand: null,
        category: "food_beverage" as const,
        match_confidence: "low" as const,
      };
    });
  }

  // Real implementation: Gemini batch prompt for fuzzy matching
  // const prompt = `You are a Canadian grocery product identifier.
  // The following abbreviated items are from a ${storeContext.name} (${storeContext.banner}) receipt.
  // For each item, provide:
  // - full_product_name: the actual product name
  // - brand: the brand (null if generic/store brand)
  // - category: one of "food_beverage", "cleaning", "personal_care", "clothing", "electronics", "home_goods"
  // - confidence: "high" if you're certain, "medium" if likely, "low" if guessing
  //
  // Common abbreviations at Canadian grocers:
  // NN = No Name, PC = President's Choice, BM = Blue Menu
  // GV = Great Value, EQ = Equate
  // WHL = Whole, WHT = Wheat/White, BRD = Bread
  // FR RNG = Free Range, LRG = Large, BNLS = Boneless
  // SHRD = Shredded, BW = Body Wash, LIQ = Liquid
  // CKN = Chicken, NDLE = Noodle, ORG = Organic
  //
  // Items:
  // ${items.map((item, i) => `${i + 1}. "${item.raw_text}" - $${item.price}`).join("\n")}
  //
  // Return JSON array with one object per item.`;
  //
  // const response = await geminiClient.generateContent(prompt);
  // return parseGeminiMatchResponse(response, items);

  throw new Error("Real Gemini matching not configured. Set USE_MOCK = false and provide API keys.");
}
