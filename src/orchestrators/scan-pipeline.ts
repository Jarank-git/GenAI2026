import type { Product } from "@/types/product";
import { processProductImage } from "@/services/cloudinary";
import { lookupByBarcode } from "@/services/open-food-facts";
import { identifyProduct } from "@/services/gemini";
import { getCachedProduct, cacheProduct } from "@/services/product-cache";
import { mockProducts } from "@/data/mock-products";

export interface ScanResult {
  product: Product;
  candidates?: Product[];
}

export async function runScanPipeline(imageFile: File): Promise<ScanResult> {
  const { cloudinaryOutput, rawImageBase64 } =
    await processProductImage(imageFile);

  // Check cache by barcode
  if (cloudinaryOutput.barcode) {
    const cached = getCachedProduct(cloudinaryOutput.barcode);
    if (cached) {
      return { product: cached };
    }
  }

  // Try Open Food Facts if we have a barcode
  if (cloudinaryOutput.barcode) {
    const offProduct = await lookupByBarcode(cloudinaryOutput.barcode);
    if (offProduct && offProduct.confidence >= 0.8) {
      cacheProduct(cloudinaryOutput.barcode, offProduct);
      return { product: offProduct };
    }
  }

  // Fall back to Gemini identification — pass raw image if Cloudinary failed
  const identified = await identifyProduct(cloudinaryOutput, rawImageBase64);

  const cacheKey =
    cloudinaryOutput.barcode ?? cloudinaryOutput.ocr_text.join("|");

  if (identified.confidence >= 0.8) {
    cacheProduct(cacheKey, identified);
    return { product: identified };
  }

  // Low confidence: provide candidates for disambiguation
  const candidates = buildCandidates(identified);
  return { product: identified, candidates };
}

function buildCandidates(primary: Product): Product[] {
  const candidates = mockProducts
    .filter((p) => p.product_id !== primary.product_id)
    .filter(
      (p) =>
        p.category === primary.category ||
        p.brand.toLowerCase() === primary.brand.toLowerCase()
    )
    .slice(0, 4);

  return [primary, ...candidates];
}
