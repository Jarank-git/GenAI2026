import { mockProducts } from "@/data/mock-products";

export async function detectBarcode(imageUrl: string): Promise<string | null> {
  if (
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

  // Mock mode: deterministically return the first mock product's barcode
  // In real mode, Cloudinary would analyze the actual image
  return mockProducts[0].barcode;
}
