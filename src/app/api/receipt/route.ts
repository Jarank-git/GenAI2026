import { NextRequest, NextResponse } from "next/server";
import type { UserProfile } from "@/types/user-profile";
import {
  processReceiptImage,
  parseReceiptText,
  matchReceiptItems,
  analyzeReceiptItems,
  generateSustainabilityReceipt,
  calculateOptimizedBasket,
} from "@/services/receipt";

const DEFAULT_PROFILE: UserProfile = {
  postal_code: "M5B 2H1",
  province: "ON",
  city: "Toronto",
  coordinates: { lat: 43.6532, lng: -79.3832 },
  vehicle: "transit",
  household_size: 2,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const receiptFile = formData.get("receipt") as File | null;

    let userProfile = DEFAULT_PROFILE;
    const profileJson = formData.get("profile") as string | null;
    if (profileJson) {
      try {
        userProfile = JSON.parse(profileJson);
      } catch {
        // use default
      }
    }

    const dummyFile = receiptFile ?? new File([""], "receipt.jpg", { type: "image/jpeg" });
    const ocrLines = await processReceiptImage(dummyFile);

    const parsedReceipt = parseReceiptText(ocrLines);

    const rawItems = parsedReceipt.items.map((item) => ({
      raw_text: item.raw_text,
      price: item.price,
      quantity: item.quantity,
    }));
    const matchedItems = await matchReceiptItems(rawItems, {
      name: parsedReceipt.store.name,
      banner: parsedReceipt.store.banner,
    });

    parsedReceipt.items = matchedItems;

    const analyzedItems = await analyzeReceiptItems(matchedItems, userProfile);

    const sustainabilityReceipt = generateSustainabilityReceipt(
      parsedReceipt,
      analyzedItems,
    );

    const optimizedBasket = calculateOptimizedBasket(analyzedItems);
    sustainabilityReceipt.optimized_basket = optimizedBasket;

    return NextResponse.json(sustainabilityReceipt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Receipt processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
