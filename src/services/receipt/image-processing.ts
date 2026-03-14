import { mockReceiptOCR } from "@/data/mock-receipt";

const USE_MOCK = true;

export async function processReceiptImage(
  imageFile: File,
): Promise<string[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockReceiptOCR;
  }

  // Real implementation: Cloudinary upload with receipt-optimized transformations
  // const formData = new FormData();
  // formData.append("file", imageFile);
  // formData.append("upload_preset", "receipt_scan");
  //
  // Transformations for receipt OCR:
  // - c_limit,w_2000 (limit size for fast processing)
  // - e_improve (auto-enhance)
  // - e_grayscale (convert to grayscale for better OCR)
  // - e_sharpen:150 (sharpen text edges)
  // - e_contrast:50 (increase contrast for faded receipts)
  //
  // const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  // const response = await fetch(
  //   `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  //   { method: "POST", body: formData }
  // );
  // const result = await response.json();
  //
  // OCR via Cloudinary add-on:
  // const ocrResponse = await fetch(
  //   `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  //   {
  //     method: "POST",
  //     body: JSON.stringify({
  //       file: result.secure_url,
  //       ocr: "adv_ocr",
  //     }),
  //   }
  // );
  // const ocrResult = await ocrResponse.json();
  // return ocrResult.info.ocr.adv_ocr.data[0].fullTextAnnotation.text.split("\n");

  throw new Error("Real Cloudinary OCR not configured. Set USE_MOCK = false and provide API keys.");
}
