export async function detectBarcode(imageUrl: string): Promise<string | null> {
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
          analysis_type: "barcode",
        }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data?.data?.barcodes?.[0]?.value ?? null;
  }

  // No real Cloudinary URL available — return null so the pipeline
  // falls through to Gemini visual identification instead of returning
  // a hardcoded mock barcode.
  return null;
}
