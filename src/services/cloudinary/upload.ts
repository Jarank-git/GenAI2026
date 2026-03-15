import crypto from "crypto";

export interface UploadResult {
  url: string;
  asset_id: string;
  /** OCR text extracted during upload (requires adv_ocr add-on) */
  ocr_text: string[];
}

export async function uploadProductImage(
  imageFile: File
): Promise<UploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    // Try upload with OCR first, fall back to plain upload if OCR add-on is unavailable
    const result = await uploadToCloudinary(imageFile, cloudName, apiKey, apiSecret, true);
    if (result) return result;

    // OCR add-on may not be active — retry without it
    console.log("[cloudinary] OCR add-on unavailable, retrying upload without OCR");
    const plainResult = await uploadToCloudinary(imageFile, cloudName, apiKey, apiSecret, false);
    if (plainResult) return plainResult;
  }

  // Mock mode
  const mockId = `mock_${Date.now()}`;
  return {
    url: `https://placeholder.ecolens.dev/upload/${mockId}.jpg`,
    asset_id: mockId,
    ocr_text: [],
  };
}

async function uploadToCloudinary(
  imageFile: File,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  withOcr: boolean
): Promise<UploadResult | null> {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Params must be sorted alphabetically for signing
  const paramsToSign = withOcr
    ? `ocr=adv_ocr&timestamp=${timestamp}`
    : `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  if (withOcr) {
    formData.append("ocr", "adv_ocr");
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const body = await res.text();
    console.warn(
      `[cloudinary] Upload failed (ocr=${withOcr}, ${res.status}): ${body}`
    );
    return null;
  }

  const data = await res.json();

  // Extract OCR text if the adv_ocr add-on returned data
  const ocrText: string[] = [];
  if (withOcr) {
    const ocrInfo = data?.info?.ocr?.adv_ocr?.data;
    if (Array.isArray(ocrInfo)) {
      for (const page of ocrInfo) {
        if (Array.isArray(page?.textAnnotations)) {
          for (const annotation of page.textAnnotations) {
            if (annotation?.description) {
              ocrText.push(annotation.description);
            }
          }
        }
      }
    }
  }

  return {
    url: data.secure_url,
    asset_id: data.asset_id,
    ocr_text: ocrText,
  };
}
