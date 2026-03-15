import type { DetectedProduct, IdentifiedShelfProduct } from "@/types/shelf";
import { mockIdentifiedProducts } from "@/data/mock-shelf";

export async function identifyShelfProducts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _detected: DetectedProduct[]
): Promise<IdentifiedShelfProduct[]> {
  // Real implementation not yet available — always use mock for now.
  // When GEMINI_API_KEY is present and a real implementation is added:
  // 1. Build a single Gemini batch prompt with all detected products' OCR text
  // 2. Parse Gemini response to extract product identity per detection
  // 3. Cross-reference barcodes with Open Food Facts API
  // 4. Map each detection to a Product with identification confidence
  return mockIdentifiedProducts;
}
