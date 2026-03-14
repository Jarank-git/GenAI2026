import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/score
 * Calculates sustainability score for a product
 * with hyperlocal adjustments based on user context.
 *
 * Implementation: see docs/implementation/03-impl-sustainability-scoring.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-8 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
