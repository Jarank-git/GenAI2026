import type { CloudinaryOutput } from "@/types/product";

export async function extractLabelText(
  imageUrl: string
): Promise<CloudinaryOutput> {
  const isRealCloudinaryUrl = imageUrl.includes("res.cloudinary.com");
  if (
    isRealCloudinaryUrl &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
        },
        body: JSON.stringify({
          source: { uri: imageUrl },
          analysis_type: "ocr",
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Cloudinary OCR failed: ${res.status}`);
    }

    const data = await res.json();
    const textAnnotations: string[] =
      data?.data?.text_annotations?.map(
        (a: { description: string }) => a.description
      ) ?? [];

    return {
      image_url: imageUrl,
      barcode: null,
      ocr_text: textAnnotations,
      brand_detected: null,
      confidence: textAnnotations.length > 0 ? 0.85 : 0.3,
    };
  }

  // No real Cloudinary URL available — return empty output so the
  // pipeline falls through to Gemini visual identification.
  return {
    image_url: imageUrl,
    barcode: null,
    ocr_text: [],
    brand_detected: null,
    confidence: 0,
  };
}
