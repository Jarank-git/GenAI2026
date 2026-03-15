import type { Product } from "@/types/product";
import { mockLifecycleData } from "@/data/mock-lifecycle";

export interface LifecycleData {
  carbon_kg_co2e: number;
  water_litres: number;
  packaging: Array<{ material: string; grams: number }>;
  land_use_m2: number;
  land_use_commodity: string;
  eutrophication_index: number;
}

const DEFAULT_LIFECYCLE: LifecycleData = {
  carbon_kg_co2e: 1.0,
  water_litres: 500,
  packaging: [{ material: "LDPE_4", grams: 20 }],
  land_use_m2: 1.0,
  land_use_commodity: "default",
  eutrophication_index: 2.0,
};

function validateLifecycleData(data: LifecycleData): LifecycleData {
  return {
    carbon_kg_co2e: Math.min(Math.max(data.carbon_kg_co2e, 0), 50),
    water_litres: Math.max(data.water_litres, 0),
    packaging: data.packaging.map((p) => ({
      material: p.material,
      grams: Math.max(p.grams, 0),
    })),
    land_use_m2: Math.max(data.land_use_m2, 0),
    land_use_commodity: data.land_use_commodity,
    eutrophication_index: Math.min(Math.max(data.eutrophication_index, 0), 10),
  };
}

export async function researchLifecycle(
  product: Product,
): Promise<LifecycleData> {
  // Try real Gemini API first
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await researchLifecycleGemini(product, apiKey);
    } catch (err) {
      console.warn("Gemini lifecycle research failed, falling back to mock:", err);
    }
  }

  // Mock fallback: look up by product_id, then fuzzy name match
  const byId = mockLifecycleData.find(
    (m) => m.product_id === product.product_id,
  );
  if (byId) {
    const { product_id: _a, product_name: _b, ...data } = byId; // eslint-disable-line @typescript-eslint/no-unused-vars
    return validateLifecycleData(data);
  }

  const nameLower = product.product_name.toLowerCase();
  const byName = mockLifecycleData.find(
    (m) =>
      nameLower.includes(m.product_name.toLowerCase()) ||
      m.product_name.toLowerCase().includes(nameLower),
  );
  if (byName) {
    const { product_id: _c, product_name: _d, ...data } = byName; // eslint-disable-line @typescript-eslint/no-unused-vars
    return validateLifecycleData(data);
  }

  return validateLifecycleData(DEFAULT_LIFECYCLE);
}

async function researchLifecycleGemini(
  product: Product,
  apiKey: string,
): Promise<LifecycleData> {
  const prompt = `For the product "${product.product_name}" by ${product.brand} (category: ${product.category}), estimate the environmental lifecycle impact per unit sold in Canada.

Provide scientifically grounded estimates for:
1. Carbon: total kg CO2e across full lifecycle (production, transport, retail, disposal)
2. Water: total litres consumed in production
3. Packaging: list each material with grams (use codes like PET_1, HDPE_2, PVC_3, LDPE_4, PP_5, PS_6, cardboard, aluminum, glass, paper)
4. Land use: m² of land-use-change attributable to this product
5. Land use commodity: primary agricultural commodity (e.g., "wheat", "palm oil", "soy", "beef")
6. Eutrophication: fertilizer/chemical runoff index (0-10 scale, 10 = worst)

Return JSON matching this schema exactly:
{
  "carbon_kg_co2e": <number>,
  "water_litres": <number>,
  "packaging": [{"material": "<string>", "grams": <number>}],
  "land_use_m2": <number>,
  "land_use_commodity": "<string>",
  "eutrophication_index": <number>
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

  const parsed = JSON.parse(text) as LifecycleData;
  return validateLifecycleData(parsed);
}
