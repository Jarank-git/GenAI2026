import { NextRequest, NextResponse } from "next/server";
import type { UserProfile } from "@/types/user-profile";
import type { ShelfScanResult } from "@/types/shelf";
import { detectShelfProducts } from "@/services/shelf/multi-detection";
import { identifyShelfProducts } from "@/services/shelf/batch-identify";
import { analyzeShelfProducts } from "@/services/shelf/parallel-analysis";

const defaultProfile: UserProfile = {
  postal_code: "M5V 3L9",
  province: "ON",
  city: "Toronto",
  coordinates: { lat: 43.6426, lng: -79.3871 },
  vehicle: {
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    fuel_type: "gasoline",
    l_per_100km: 7.1,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const profileJson = formData.get("userProfile") as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const userProfile: UserProfile = profileJson
      ? JSON.parse(profileJson)
      : defaultProfile;

    const imageUrl = `https://placeholder.ecolens.dev/shelf-${Date.now()}.jpg`;

    const detected = await detectShelfProducts(imageUrl);
    const identified = await identifyShelfProducts(detected);
    const analyzed = await analyzeShelfProducts(identified, userProfile);

    const bestProduct = analyzed.find((p) => p.is_best_on_shelf);

    const result: ShelfScanResult = {
      image_url: imageUrl,
      products: analyzed,
      best_product_id: bestProduct?.product.product_id ?? null,
      scanned_at: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process shelf image", details: message },
      { status: 500 }
    );
  }
}
