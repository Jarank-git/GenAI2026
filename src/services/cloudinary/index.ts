import type { CloudinaryOutput } from "@/types/product";
import { uploadProductImage } from "./upload";
import { detectBarcode } from "./barcode";
import { extractLabelText } from "./ocr";

export async function processProductImage(
  imageFile: File
): Promise<CloudinaryOutput> {
  const { url } = await uploadProductImage(imageFile);

  const [barcode, ocrResult] = await Promise.all([
    detectBarcode(url),
    extractLabelText(url),
  ]);

  return {
    ...ocrResult,
    image_url: url,
    barcode: barcode ?? ocrResult.barcode,
  };
}

export { uploadProductImage, detectBarcode, extractLabelText };
