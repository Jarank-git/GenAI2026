import type { DetectedProduct } from "@/types/shelf";
import { mockDetectedProducts } from "@/data/mock-shelf";

const MAX_PRODUCTS = 15;
const MIN_CONFIDENCE = 0.5;

function deduplicateByOcr(products: DetectedProduct[]): DetectedProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.ocr_text.join(" ").toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function detectShelfProducts(
  imageUrl: string
): Promise<DetectedProduct[]> {
  const useMock = !process.env.CLOUDINARY_API_KEY;

  if (useMock) {
    return mockDetectedProducts;
  }

  // Real implementation scaffold:
  // 1. Upload image to Cloudinary
  // 2. Use Cloudinary object detection to find product regions
  // 3. For each region, run OCR to extract text
  // 4. Attempt barcode detection per region
  // 5. Filter, deduplicate, and cap results

  const detected: DetectedProduct[] = [];

  const filtered = detected.filter(
    (p) => p.detection_confidence >= MIN_CONFIDENCE
  );
  const deduped = deduplicateByOcr(filtered);

  return deduped.slice(0, MAX_PRODUCTS);
}
