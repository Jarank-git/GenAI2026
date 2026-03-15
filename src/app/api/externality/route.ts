import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import { calculateTotalExternality } from "@/orchestrators/externality-pipeline";

const DEFAULT_PROFILE: UserProfile = {
  postal_code: "M5V 3L9",
  province: "ON",
  city: "Toronto",
  coordinates: { lat: 43.6426, lng: -79.3871 },
  vehicle: "transit",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product,
      userProfile,
      shelfPrice,
      gasCost,
    }: {
      product: Product;
      userProfile?: UserProfile;
      shelfPrice?: number;
      gasCost?: number;
    } = body;

    if (!product || !product.product_id || !product.product_name) {
      return NextResponse.json(
        { error: "Missing required field: product (with product_id and product_name)" },
        { status: 400 },
      );
    }

    const profile = userProfile ?? DEFAULT_PROFILE;

    const externality = await calculateTotalExternality(
      product,
      profile,
      shelfPrice,
      gasCost,
    );

    return NextResponse.json(externality);
  } catch (error) {
    console.error("Externality calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate externality cost" },
      { status: 500 },
    );
  }
}
