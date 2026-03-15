import type { CloudinaryOutput } from "@/types/product";
import { uploadProductImage } from "./upload";

export interface ProcessedImage {
  cloudinaryOutput: CloudinaryOutput;
  /** Raw image base64 for Gemini fallback when Cloudinary upload fails */
  rawImageBase64?: { data: string; mimeType: string };
}

export async function processProductImage(
  imageFile: File
): Promise<ProcessedImage> {
  // Always preserve raw image bytes for Gemini — avoids a round-trip fetch
  // that can fail silently and leave Gemini with no image to analyze
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";
  const rawImageBase64 = { data: base64, mimeType };

  const { url, ocr_text } = await uploadProductImage(imageFile);

  const isRealUpload = url.includes("res.cloudinary.com");

  if (isRealUpload) {
    // Try to extract a barcode-like string from OCR text (EAN-13, UPC-A)
    const barcode = extractBarcodeFromOcr(ocr_text);

    console.log("[scan-pipeline] Cloudinary upload succeeded:", {
      url,
      ocrTextCount: ocr_text.length,
      barcode,
      brand: ocr_text.length > 0 ? ocr_text[0] : null,
    });

    return {
      cloudinaryOutput: {
        image_url: url,
        barcode,
        ocr_text,
        brand_detected: ocr_text.length > 0 ? ocr_text[0] : null,
        confidence: ocr_text.length > 0 ? 0.85 : 0.5,
      },
      rawImageBase64,
    };
  }

  console.log("[scan-pipeline] Cloudinary upload failed, using raw image fallback");

  return {
    cloudinaryOutput: {
      image_url: url,
      barcode: null,
      ocr_text: [],
      brand_detected: null,
      confidence: 0,
    },
    rawImageBase64,
  };
}

/**
 * Look for barcode-like numeric strings in OCR text (EAN-13: 13 digits, UPC-A: 12 digits).
 */
function extractBarcodeFromOcr(ocrText: string[]): string | null {
  for (const text of ocrText) {
    const match = text.match(/\b(\d{12,13})\b/);
    if (match) return match[1];
  }
  return null;
}

export { uploadProductImage };
