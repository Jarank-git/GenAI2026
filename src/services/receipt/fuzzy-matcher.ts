import type { ReceiptItem } from "@/types/receipt";
import { mockMatchedItems } from "@/data/mock-receipt";

const USE_MOCK = !process.env.GEMINI_API_KEY;

export async function matchReceiptItems(
  items: Array<{ raw_text: string; price: number; quantity: number }>,
  storeContext: { name: string; banner: string },
): Promise<ReceiptItem[]> {
  if (!USE_MOCK) {
    try {
      return await matchReceiptItemsGemini(items, storeContext);
    } catch (err) {
      console.warn("Gemini receipt matching failed, falling back to mock:", err);
    }
  }

  // Mock fallback: match against known mock items
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

async function matchReceiptItemsGemini(
  items: Array<{ raw_text: string; price: number; quantity: number }>,
  storeContext: { name: string; banner: string },
): Promise<ReceiptItem[]> {
  const apiKey = process.env.GEMINI_API_KEY!;

  const prompt = `You are a Canadian grocery product identifier.
The following abbreviated items are from a ${storeContext.name} (${storeContext.banner}) receipt.
For each item, provide:
- matched_product: the actual full product name
- brand: the brand (null if generic/store brand)
- category: one of "food_beverage", "cleaning", "personal_care", "clothing", "electronics", "home_goods"
- match_confidence: "high" if you're certain, "medium" if likely, "low" if guessing

Common abbreviations at Canadian grocers:
NN = No Name, PC = President's Choice, BM = Blue Menu
GV = Great Value, EQ = Equate
WHL = Whole, WHT = Wheat/White, BRD = Bread
FR RNG = Free Range, LRG = Large, BNLS = Boneless
SHRD = Shredded, BW = Body Wash, LIQ = Liquid
CKN = Chicken, NDLE = Noodle, ORG = Organic

Items:
${items.map((item, i) => `${i + 1}. "${item.raw_text}" - $${item.price}`).join("\n")}

Return a JSON array with one object per item, each having: raw_text, price, quantity, matched_product, brand, category, match_confidence.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");

  const parsed = JSON.parse(text) as ReceiptItem[];

  // Merge Gemini results with original item data
  return items.map((item, i) => ({
    ...item,
    matched_product: parsed[i]?.matched_product ?? item.raw_text,
    brand: parsed[i]?.brand ?? null,
    category: parsed[i]?.category ?? "food_beverage",
    match_confidence: parsed[i]?.match_confidence ?? "low",
  }));
}
