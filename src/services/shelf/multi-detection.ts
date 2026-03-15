import type { DetectedProduct } from "@/types/shelf";
import { mockDetectedProducts } from "@/data/mock-shelf";

export async function detectShelfProducts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageUrl: string
): Promise<DetectedProduct[]> {
  // Real implementation not yet available — always use mock for now.
  // When CLOUDINARY_API_KEY is present and a real implementation is added:
  // 1. Upload image to Cloudinary
  // 2. Use Cloudinary object detection to find product regions
  // 3. For each region, run OCR to extract text
  // 4. Attempt barcode detection per region
  // 5. Filter, deduplicate, and cap results
  return mockDetectedProducts;
}
