import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/receipt
 * Processes a receipt image: OCR extraction, fuzzy matching,
 * batch analysis, and sustainability receipt generation.
 *
 * Implementation: see docs/implementation/07-impl-receipt-scanning.md
 */
export async function POST(request: NextRequest) {
  // TODO: Implement — see Step 1-6 in implementation plan
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
