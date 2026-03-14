import type { ParsedReceipt, ReceiptItem } from "@/types/receipt";

const STORE_BANNERS: Record<string, string> = {
  LOBLAWS: "loblaws",
  "LOBLAW": "loblaws",
  "NO FRILLS": "nofrills",
  "NOFRILLS": "nofrills",
  WALMART: "walmart",
  "WAL-MART": "walmart",
  METRO: "metro",
  SOBEYS: "sobeys",
  "FOOD BASICS": "foodbasics",
  FRESHCO: "freshco",
  ZEHRS: "zehrs",
  "REAL CANADIAN SUPERSTORE": "superstore",
  SUPERSTORE: "superstore",
  "YOUR INDEPENDENT GROCER": "independentgrocer",
  "T&T": "tnt",
  COSTCO: "costco",
  "SHOPPERS DRUG MART": "shoppersdrugmart",
  FORTINOS: "fortinos",
  VALU_MART: "valumart",
  "VALU-MART": "valumart",
};

const FILTER_KEYWORDS = [
  "SUBTOTAL",
  "SUB TOTAL",
  "HST",
  "GST",
  "PST",
  "TAX",
  "TOTAL",
  "VISA",
  "MASTERCARD",
  "DEBIT",
  "CASH",
  "CHANGE",
  "OPTIMUM",
  "POINTS",
  "PTS",
  "SCENE",
  "THANK YOU",
  "COME AGAIN",
  "MEMBER",
  "SAVINGS",
  "DISCOUNT",
];

const PRICE_PATTERN = /^(.+?)\s+([\d]+\.[\d]{2})\s*$/;
const QUANTITY_PATTERN = /^(\d+)\s*[xX]\s+(.+)$/;
const DATE_PATTERN =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;

function detectBanner(storeName: string): string {
  const upper = storeName.toUpperCase().trim();
  for (const [key, value] of Object.entries(STORE_BANNERS)) {
    if (upper.includes(key)) return value;
  }
  return upper.toLowerCase().replace(/\s+/g, "");
}

function isFilteredLine(text: string): boolean {
  const upper = text.toUpperCase().trim();
  if (upper === "") return true;
  return FILTER_KEYWORDS.some((kw) => upper.startsWith(kw));
}

function extractDate(lines: string[]): string {
  for (const line of lines.slice(0, 6)) {
    const match = line.match(DATE_PATTERN);
    if (match) return match[0];
  }
  return "";
}

export function parseReceiptText(ocrLines: string[]): ParsedReceipt {
  const cleanLines = ocrLines.map((l) => l.trim());

  const storeName = cleanLines[0] || "Unknown Store";
  const storeAddress = cleanLines.length > 1 ? cleanLines[1] : "";
  const storeDate = extractDate(cleanLines);
  const banner = detectBanner(storeName);

  const items: ReceiptItem[] = [];
  let receiptTotal = 0;

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];

    if (isFilteredLine(line)) {
      const totalMatch = line.match(/^TOTAL\s+([\d]+\.[\d]{2})/i);
      if (totalMatch) {
        receiptTotal = parseFloat(totalMatch[1]);
      }
      continue;
    }

    if (i < 3) continue;

    const priceMatch = line.match(PRICE_PATTERN);
    if (!priceMatch) continue;

    let itemText = priceMatch[1].trim();
    const price = parseFloat(priceMatch[2]);
    let quantity = 1;

    const qtyMatch = itemText.match(QUANTITY_PATTERN);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
      itemText = qtyMatch[2].trim();
    }

    items.push({
      raw_text: itemText,
      price,
      quantity,
      matched_product: null,
      brand: null,
      category: null,
      match_confidence: "low",
    });
  }

  if (receiptTotal === 0 && items.length > 0) {
    receiptTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    receiptTotal = Math.round(receiptTotal * 100) / 100;
  }

  return {
    store: {
      name: storeName,
      banner,
      date: storeDate,
      address: storeAddress,
    },
    items,
    total: receiptTotal,
  };
}
