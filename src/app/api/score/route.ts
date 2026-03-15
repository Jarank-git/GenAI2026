import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import { scoreProduct } from "@/orchestrators/scoring-pipeline";

const DEFAULT_PROFILE: UserProfile = {
  postal_code: "M5V 3L9",
  province: "Ontario",
  city: "Toronto",
  coordinates: { lat: 43.6426, lng: -79.3871 },
  vehicle: "transit",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, userProfile } = body as {
      product: Product;
      userProfile?: UserProfile;
    };

    if (!product || !product.product_id || !product.product_name) {
      return NextResponse.json(
        { error: "Invalid product data. Required: product_id, product_name, brand, category." },
        { status: 400 },
      );
    }

    const profile = userProfile ?? DEFAULT_PROFILE;
    const score = await scoreProduct(product, profile);

    return NextResponse.json(score);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Scoring failed: ${message}` },
      { status: 500 },
    );
  }
}
