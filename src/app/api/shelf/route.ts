import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/shelf
 * Processes a shelf image: multi-product detection,
 * batch identification, parallel scoring, and overlay data.
 *
 * Implementation: see docs/implementation/08-impl-ar-shelf-scanner.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-5 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
