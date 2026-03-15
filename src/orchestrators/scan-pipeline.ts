import type { Product } from "@/types/product";
import { processProductImage } from "@/services/cloudinary";
import { lookupByBarcode } from "@/services/open-food-facts";
import { identifyProduct } from "@/services/gemini";
import { getCachedProduct, cacheProduct } from "@/services/product-cache";

export interface ScanResult {
  product: Product;
  candidates?: Product[];
}

export async function runScanPipeline(imageFile: File): Promise<ScanResult> {
  console.log("[scan-pipeline] Starting scan for:", imageFile.name, imageFile.type, `${(imageFile.size / 1024).toFixed(0)}KB`);

  const { cloudinaryOutput, rawImageBase64 } =
    await processProductImage(imageFile);

  // Check cache by barcode
  if (cloudinaryOutput.barcode) {
    const cached = getCachedProduct(cloudinaryOutput.barcode);
    if (cached) {
      console.log("[scan-pipeline] Cache hit for barcode:", cloudinaryOutput.barcode);
      return { product: cached };
    }
  }

  // Try Open Food Facts if we have a barcode
  if (cloudinaryOutput.barcode) {
    console.log("[scan-pipeline] Looking up barcode in Open Food Facts:", cloudinaryOutput.barcode);
    const offProduct = await lookupByBarcode(cloudinaryOutput.barcode);
    if (offProduct && offProduct.confidence >= 0.8) {
      cacheProduct(cloudinaryOutput.barcode, offProduct);
      console.log("[scan-pipeline] OFF match:", offProduct.product_name);
      return { product: offProduct };
    }
  }

  // Fall back to Gemini identification — always pass raw image for reliable identification
  console.log("[scan-pipeline] Calling Gemini for identification, hasRawImage:", !!rawImageBase64);
  const identified = await identifyProduct(cloudinaryOutput, rawImageBase64);

  console.log("[scan-pipeline] Gemini result:", identified.product_name, "confidence:", identified.confidence);

  const cacheKey =
    cloudinaryOutput.barcode ?? cloudinaryOutput.ocr_text.join("|");

  if (identified.confidence >= 0.5) {
    cacheProduct(cacheKey, identified);
    return { product: identified };
  }

  // Very low confidence: return as single candidate for disambiguation
  return { product: identified, candidates: [identified] };
}
