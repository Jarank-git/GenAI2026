import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/scan
 * Receives a product image, processes it through Cloudinary,
 * identifies the product via Gemini, and returns product data.
 *
 * Implementation: see docs/implementation/01-impl-product-scanning.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-5 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
