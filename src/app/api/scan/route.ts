import { NextRequest, NextResponse } from "next/server";
import { runScanPipeline } from "@/orchestrators/scan-pipeline";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid image file. Send as FormData with key 'image'." },
        { status: 400 }
      );
    }

    const result = await runScanPipeline(imageFile);

    return NextResponse.json({
      product: result.product,
      candidates: result.candidates ?? null,
      needs_disambiguation: !!result.candidates,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during scan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
