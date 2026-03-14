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
  // Mock implementation: look up by product_id, then fuzzy name match
  const byId = mockLifecycleData.find(
    (m) => m.product_id === product.product_id,
  );
  if (byId) {
    const { product_id: _, product_name: __, ...data } = byId;
    return validateLifecycleData(data);
  }

  const nameLower = product.product_name.toLowerCase();
  const byName = mockLifecycleData.find(
    (m) =>
      nameLower.includes(m.product_name.toLowerCase()) ||
      m.product_name.toLowerCase().includes(nameLower),
  );
  if (byName) {
    const { product_id: _, product_name: __, ...data } = byName;
    return validateLifecycleData(data);
  }

  // TODO: Real Gemini API implementation
  // const prompt = `For ${product.product_name} by ${product.brand}, estimate the environmental impact per unit sold in Canada:
  //  1. Carbon: total kg CO2e across lifecycle
  //  2. Water: total litres consumed in production
  //  3. Plastic: grams of packaging by type
  //  4. Land use: m² of land-use-change attributable
  //  5. Eutrophication: fertilizer/chemical runoff index (0-10)`;
  //
  // const response = await geminiClient.generateContent({
  //   contents: [{ role: "user", parts: [{ text: prompt }] }],
  //   generationConfig: {
  //     responseMimeType: "application/json",
  //     responseSchema: lifecycleSchema,
  //   },
  // });

  return validateLifecycleData(DEFAULT_LIFECYCLE);
}
