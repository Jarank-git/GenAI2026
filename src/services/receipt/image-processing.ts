import { mockReceiptOCR } from "@/data/mock-receipt";

const USE_MOCK = !process.env.CLOUDINARY_API_KEY || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export async function processReceiptImage(
  imageFile: File,
): Promise<string[]> {
  if (!USE_MOCK) {
    try {
      return await processReceiptImageReal(imageFile);
    } catch (err) {
      console.warn("Cloudinary receipt OCR failed, falling back to mock:", err);
    }
  }

  return mockReceiptOCR;
}

async function processReceiptImageReal(imageFile: File): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // Upload the receipt image to Cloudinary with OCR-optimized transformations
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${imageFile.type || "image/jpeg"};base64,${base64}`;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=receipts&ocr=adv_ocr&timestamp=${timestamp}`;
  const { createHash } = await import("crypto");
  const signature = createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const formData = new FormData();
  formData.append("file", dataUri);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", "receipts");
  formData.append("ocr", "adv_ocr");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }

  const result = await response.json();
  const ocrText = result.info?.ocr?.adv_ocr?.data?.[0]?.fullTextAnnotation?.text;

  if (!ocrText) {
    throw new Error("No OCR text returned from Cloudinary");
  }

  return ocrText.split("\n").filter((line: string) => line.trim().length > 0);
}
