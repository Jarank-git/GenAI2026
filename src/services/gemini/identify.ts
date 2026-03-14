import type { Product, CloudinaryOutput, ProductCategory } from "@/types/product";
import { mockProducts } from "@/data/mock-products";

export async function identifyProduct(
  input: CloudinaryOutput
): Promise<Product> {
  if (process.env.GEMINI_API_KEY) {
    return identifyWithGemini(input);
  }
  return identifyWithMock(input);
}

async function identifyWithGemini(input: CloudinaryOutput): Promise<Product> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const prompt = buildPrompt(input);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              product_name: { type: "string" },
              brand: { type: "string" },
              category: {
                type: "string",
                enum: [
                  "food_beverage",
                  "cleaning",
                  "personal_care",
                  "clothing",
                  "electronics",
                  "home_goods",
                ],
              },
              weight_volume: { type: "string" },
              confidence: { type: "number" },
            },
            required: [
              "product_name",
              "brand",
              "category",
              "weight_volume",
              "confidence",
            ],
          },
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");

  const parsed = JSON.parse(text);

  return {
    product_id: `gemini-${Date.now()}`,
    product_name: parsed.product_name,
    brand: parsed.brand,
    category: parsed.category as ProductCategory,
    weight_volume: parsed.weight_volume,
    barcode: input.barcode,
    image_url: input.image_url,
    confidence: parsed.confidence,
    open_food_facts_match: false,
  };
}

function buildPrompt(input: CloudinaryOutput): string {
  const parts: string[] = [
    "Identify this product from the following label information.",
    "Return a JSON object with: product_name, brand, category, weight_volume, confidence (0-1).",
  ];

  if (input.brand_detected) {
    parts.push(`Detected brand: ${input.brand_detected}`);
  }
  if (input.ocr_text.length > 0) {
    parts.push(`OCR text from label: ${input.ocr_text.join(", ")}`);
  }
  if (input.barcode) {
    parts.push(`Barcode: ${input.barcode}`);
  }

  parts.push(
    'Categories must be one of: food_beverage, cleaning, personal_care, clothing, electronics, home_goods.'
  );

  return parts.join("\n");
}

function identifyWithMock(input: CloudinaryOutput): Product {
  // Try to match by barcode first
  if (input.barcode) {
    const barcodeMatch = mockProducts.find((p) => p.barcode === input.barcode);
    if (barcodeMatch) {
      return { ...barcodeMatch, image_url: input.image_url };
    }
  }

  // Try to match by brand or OCR text
  if (input.brand_detected || input.ocr_text.length > 0) {
    const searchTerms = [
      input.brand_detected?.toLowerCase(),
      ...input.ocr_text.map((t) => t.toLowerCase()),
    ].filter(Boolean) as string[];

    let bestMatch: Product | null = null;
    let bestScore = 0;

    for (const product of mockProducts) {
      let score = 0;
      const name = product.product_name.toLowerCase();
      const brand = product.brand.toLowerCase();

      for (const term of searchTerms) {
        if (brand.includes(term) || term.includes(brand)) score += 3;
        if (name.includes(term) || term.includes(name)) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    }

    if (bestMatch && bestScore > 0) {
      return { ...bestMatch, image_url: input.image_url };
    }
  }

  // Fallback: return random mock product with lower confidence
  const randomIndex = Math.floor(Math.random() * mockProducts.length);
  return {
    ...mockProducts[randomIndex],
    image_url: input.image_url,
    confidence: 0.6,
  };
}
