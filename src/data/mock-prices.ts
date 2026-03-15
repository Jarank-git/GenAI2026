import type { PriceConfidence } from "@/types/pricing";

export interface MockPriceEntry {
  product_id: string;
  product_name: string;
  stores: Array<{
    store_name: string;
    banner: string;
    price: number;
    unit_price: number | null;
    confidence: PriceConfidence;
    source_url: string | null;
  }>;
}

export const mockPrices: MockPriceEntry[] = [
  {
    product_id: "mock-barilla-spaghetti",
    product_name: "Barilla Spaghetti",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 2.99, unit_price: 0.60, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 2.49, unit_price: 0.50, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 2.69, unit_price: 0.54, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 2.47, unit_price: 0.49, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/barilla-spaghetti-500g/6000016419812" },
      { store_name: "Metro", banner: "metro", price: 3.29, unit_price: 0.66, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/barilla-spaghetti-500g" },
      { store_name: "Sobeys", banner: "sobeys", price: 3.19, unit_price: 0.64, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/barilla-spaghetti-500g" },
    ],
  },
  {
    product_id: "mock-pc-organic-milk",
    product_name: "President's Choice Organic Milk 2%",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 7.49, unit_price: 3.75, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 7.29, unit_price: 3.65, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 7.29, unit_price: 3.65, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 7.47, unit_price: 3.74, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/pc-organic-milk-2-2l/6000200392584" },
      { store_name: "Metro", banner: "metro", price: 7.99, unit_price: 4.00, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/pc-organic-milk-2pct-2l" },
      { store_name: "Sobeys", banner: "sobeys", price: 7.79, unit_price: 3.90, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/pc-organic-milk-2pct-2l" },
    ],
  },
  {
    product_id: "mock-kraft-peanut-butter",
    product_name: "Kraft Peanut Butter Smooth",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 8.49, unit_price: 0.85, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 7.99, unit_price: 0.80, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 7.99, unit_price: 0.80, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 7.97, unit_price: 0.80, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/kraft-peanut-butter-smooth-1kg/6000016003530" },
      { store_name: "Metro", banner: "metro", price: 8.99, unit_price: 0.90, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/kraft-peanut-butter-smooth-1kg" },
      { store_name: "Sobeys", banner: "sobeys", price: 8.79, unit_price: 0.88, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/kraft-peanut-butter-smooth-1kg" },
    ],
  },
  {
    product_id: "mock-great-value-tomatoes",
    product_name: "Great Value Canned Diced Tomatoes",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 1.79, unit_price: 0.22, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 1.49, unit_price: 0.19, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 1.49, unit_price: 0.19, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 1.27, unit_price: 0.16, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/great-value-diced-tomatoes-796ml/6000191284803" },
      { store_name: "Metro", banner: "metro", price: 1.99, unit_price: 0.25, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/great-value-diced-tomatoes-796ml" },
      { store_name: "Sobeys", banner: "sobeys", price: 1.89, unit_price: 0.24, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/great-value-diced-tomatoes-796ml" },
    ],
  },
  {
    product_id: "mock-quaker-oats",
    product_name: "Quaker Large Flake Oats",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 6.49, unit_price: 0.65, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 5.99, unit_price: 0.60, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 5.99, unit_price: 0.60, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 5.97, unit_price: 0.60, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/quaker-large-flake-oats-1kg/6000016001284" },
      { store_name: "Metro", banner: "metro", price: 6.99, unit_price: 0.70, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/quaker-large-flake-oats-1kg" },
      { store_name: "Sobeys", banner: "sobeys", price: 6.79, unit_price: 0.68, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/quaker-large-flake-oats-1kg" },
    ],
  },
  {
    product_id: "mock-seventh-gen-dish-soap",
    product_name: "Seventh Generation Dish Soap Free & Clear",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 5.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 5.49, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 5.49, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 5.47, unit_price: null, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/seventh-generation-dish-soap-750ml/6000200123456" },
      { store_name: "Metro", banner: "metro", price: 6.49, unit_price: null, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/seventh-generation-dish-soap-750ml" },
      { store_name: "Sobeys", banner: "sobeys", price: 6.29, unit_price: null, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/seventh-generation-dish-soap-750ml" },
    ],
  },
  {
    product_id: "mock-tide-pods",
    product_name: "Tide PODS Laundry Detergent Original",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 16.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 15.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 15.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 15.97, unit_price: null, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/tide-pods-original-42ct/6000200543210" },
      { store_name: "Metro", banner: "metro", price: 17.99, unit_price: null, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/tide-pods-original-42ct" },
      { store_name: "Sobeys", banner: "sobeys", price: 17.49, unit_price: null, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/tide-pods-original-42ct" },
    ],
  },
  {
    product_id: "mock-dove-body-wash",
    product_name: "Dove Deep Moisture Body Wash",
    stores: [
      { store_name: "Loblaws", banner: "loblaws", price: 8.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "No Frills", banner: "nofrills", price: 8.49, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 8.49, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Walmart", banner: "walmart", price: 7.97, unit_price: null, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/dove-deep-moisture-body-wash-650ml/6000016419234" },
      { store_name: "Metro", banner: "metro", price: 9.49, unit_price: null, confidence: "web_estimate", source_url: "https://www.metro.ca/en/online-grocery/dove-deep-moisture-body-wash-650ml" },
      { store_name: "Sobeys", banner: "sobeys", price: 9.29, unit_price: null, confidence: "web_estimate", source_url: "https://www.sobeys.com/en/product/dove-deep-moisture-body-wash-650ml" },
    ],
  },
  {
    product_id: "mock-gildan-tshirt",
    product_name: "Gildan Heavy Cotton T-Shirt",
    stores: [
      { store_name: "Walmart", banner: "walmart", price: 7.97, unit_price: null, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/gildan-heavy-cotton-tshirt/6000200654321" },
      { store_name: "Loblaws", banner: "loblaws", price: 9.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 8.99, unit_price: null, confidence: "verified", source_url: null },
    ],
  },
  {
    product_id: "mock-anker-usbc-cable",
    product_name: "Anker USB-C to USB-C Cable",
    stores: [
      { store_name: "Walmart", banner: "walmart", price: 12.97, unit_price: null, confidence: "web_estimate", source_url: "https://www.walmart.ca/en/ip/anker-usb-c-cable/6000200765432" },
      { store_name: "Loblaws", banner: "loblaws", price: 14.99, unit_price: null, confidence: "verified", source_url: null },
      { store_name: "Real Canadian Superstore", banner: "superstore", price: 13.99, unit_price: null, confidence: "verified", source_url: null },
    ],
  },
];

export function findMockPrices(productId: string): MockPriceEntry | undefined {
  return mockPrices.find((p) => p.product_id === productId);
}

export function findMockPriceByName(productName: string): MockPriceEntry | undefined {
  const lower = productName.toLowerCase();
  return mockPrices.find((p) => p.product_name.toLowerCase().includes(lower) || lower.includes(p.product_name.toLowerCase()));
}
