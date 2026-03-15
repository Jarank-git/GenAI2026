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
  const { url, ocr_text } = await uploadProductImage(imageFile);

  const isRealUpload = url.includes("res.cloudinary.com");

  if (isRealUpload) {
    // Try to extract a barcode-like string from OCR text (EAN-13, UPC-A)
    const barcode = extractBarcodeFromOcr(ocr_text);

    return {
      cloudinaryOutput: {
        image_url: url,
        barcode,
        ocr_text,
        brand_detected: ocr_text.length > 0 ? ocr_text[0] : null,
        confidence: ocr_text.length > 0 ? 0.85 : 0.5,
      },
    };
  }

  // Upload failed — convert raw image to base64 so Gemini can see it
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  return {
    cloudinaryOutput: {
      image_url: url,
      barcode: null,
      ocr_text: [],
      brand_detected: null,
      confidence: 0,
    },
    rawImageBase64: { data: base64, mimeType },
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
