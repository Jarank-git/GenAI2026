import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/pricing
 * Fetches prices for a product across all available stores
 * using the 3-layer pricing architecture.
 *
 * Implementation: see docs/implementation/02-impl-multi-layer-pricing.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-6 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
