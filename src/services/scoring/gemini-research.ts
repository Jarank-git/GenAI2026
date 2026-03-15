import type { Product } from "@/types/product";
import type { FactorScores } from "@/types/scoring";
import { getMockSustainabilityData } from "@/data/mock-sustainability";

export interface SustainabilityResearchResult {
  factors: FactorScores;
  origin_country: string;
  transport_mode: string;
  transport_distance_km: number;
  packaging_materials: string[];
  certifications: string[];
}

const USE_MOCK = !process.env.GEMINI_API_KEY;

export async function researchSustainability(
  product: Product,
): Promise<SustainabilityResearchResult> {
  if (USE_MOCK) {
    return researchSustainabilityMock(product);
  }
  return researchSustainabilityGemini(product);
}

async function researchSustainabilityMock(
  product: Product,
): Promise<SustainabilityResearchResult> {
  const mockData = getMockSustainabilityData(product.product_id);

  if (mockData) {
    return {
      factors: mockData.factors,
      origin_country: mockData.origin_country,
      transport_mode: mockData.transport_mode,
      transport_distance_km: mockData.transport_distance_km,
      packaging_materials: mockData.packaging_materials,
      certifications: mockData.certifications,
    };
  }

  return {
    factors: {
      transport: 50,
      packaging: 50,
      certifications: 30,
      brand_ethics: 50,
      production: 50,
      end_of_life: 40,
    },
    origin_country: "Unknown",
    transport_mode: "truck",
    transport_distance_km: 2000,
    packaging_materials: ["mixed materials"],
    certifications: [],
  };
}

async function researchSustainabilityGemini(
  product: Product,
): Promise<SustainabilityResearchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `For ${product.product_name} by ${product.brand}:
1. Country/region of origin and primary transport route to Canada
2. Packaging materials and weight
3. Certifications held (organic, fair trade, B Corp, Rainforest Alliance, etc.)
4. Known brand practices
5. Production method
6. End-of-life recyclability

Score each factor 0-100. This product is sold in Canada. Consider Canadian certifications.

Return JSON matching this schema exactly:
{
  "factors": {
    "transport": <0-100>,
    "packaging": <0-100>,
    "certifications": <0-100>,
    "brand_ethics": <0-100>,
    "production": <0-100>,
    "end_of_life": <0-100>
  },
  "origin_country": "<string>",
  "transport_mode": "<ship|truck|air|rail>",
  "transport_distance_km": <number>,
  "packaging_materials": ["<string>"],
  "certifications": ["<string>"]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  const parsed = JSON.parse(text) as SustainabilityResearchResult;

  const factors = parsed.factors;
  for (const key of Object.keys(factors) as (keyof FactorScores)[]) {
    factors[key] = Math.max(0, Math.min(100, Math.round(factors[key])));
  }

  return parsed;
}
