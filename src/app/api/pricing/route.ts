import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import { fetchAllPrices } from "@/orchestrators/pricing-pipeline";

const DEFAULT_USER_PROFILE: UserProfile = {
  postal_code: "M5V 2T6",
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
    const body = await request.json();
    const product: Product | undefined = body.product;
    const userProfile: UserProfile = body.userProfile ?? DEFAULT_USER_PROFILE;

    if (!product || !product.product_id || !product.product_name) {
      return NextResponse.json(
        { error: "Missing required field: product (with product_id and product_name)" },
        { status: 400 }
      );
    }

    const pricingResponse = await fetchAllPrices(product, userProfile);

    return NextResponse.json(pricingResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Pricing request failed: ${message}` },
      { status: 500 }
    );
  }
}
