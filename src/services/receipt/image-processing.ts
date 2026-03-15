import { mockReceiptOCR } from "@/data/mock-receipt";

const HAS_CLOUDINARY =
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_SECRET;
const HAS_GEMINI = !!process.env.GEMINI_API_KEY;

export async function processReceiptImage(
  imageFile: File,
): Promise<string[]> {
  // Read file data once upfront so both OCR methods can use it
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  // 1. Try Cloudinary OCR (adv_ocr add-on)
  if (HAS_CLOUDINARY) {
    try {
      const lines = await processReceiptWithCloudinary(base64, mimeType);
      if (lines.length > 0) {
        console.log("[receipt] Cloudinary OCR succeeded:", lines.length, "lines");
        return lines;
      }
    } catch (err) {
      console.warn("[receipt] Cloudinary OCR failed:", err);
    }
  }

  // 2. Fall back to Gemini vision OCR
  if (HAS_GEMINI) {
    try {
      const lines = await processReceiptWithGemini(base64, mimeType);
      if (lines.length > 0) {
        console.log("[receipt] Gemini vision OCR succeeded:", lines.length, "lines");
        return lines;
      }
    } catch (err) {
      console.warn("[receipt] Gemini vision OCR failed:", err);
    }
  }

  // 3. Last resort: mock data
  console.warn("[receipt] All OCR methods failed, using mock data");
  return mockReceiptOCR;
}

async function processReceiptWithCloudinary(
  base64: string,
  mimeType: string,
): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const dataUri = `data:${mimeType};base64,${base64}`;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=receipts&ocr=adv_ocr&timestamp=${timestamp}`;
  const { createHash } = await import("crypto");
  const signature = createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

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
    const body = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
  }

  const result = await response.json();
  const ocrText =
    result.info?.ocr?.adv_ocr?.data?.[0]?.fullTextAnnotation?.text;

  if (!ocrText) {
    throw new Error("No OCR text returned from Cloudinary");
  }

  return ocrText.split("\n").filter((line: string) => line.trim().length > 0);
}

async function processReceiptWithGemini(
  base64: string,
  mimeType: string,
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY!;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
              {
                text: `Extract ALL text from this receipt image exactly as printed.
Return each line of text on its own line, preserving the original layout.
Include:
- Store name and address (first lines)
- Date and time
- Each item with its price on the same line (e.g. "NN ORG PENNE 900G         2.49")
- Subtotal, tax, and total lines
- Payment method line

Preserve the original abbreviations and formatting exactly as they appear.
Do NOT interpret, expand, or correct abbreviations.
Return ONLY the raw receipt text, no commentary, headers, or markdown formatting.`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini vision OCR failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini vision response");

  return text.split("\n").filter((line: string) => line.trim().length > 0);
}
