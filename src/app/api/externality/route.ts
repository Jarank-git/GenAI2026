import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/externality
 * Calculates the monetized environmental externality cost
 * for a product using lifecycle research and Canadian pricing models.
 *
 * Implementation: see docs/implementation/06-impl-externality-pricing.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-7 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
