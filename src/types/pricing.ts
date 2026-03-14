export type PriceConfidence = "verified" | "web_estimate" | "unavailable";

export interface PriceResult {
  store_name: string;
  banner: string;
  price: number;
  unit_price: number | null;
  confidence: PriceConfidence;
  source_url: string | null;
  distance_km: number | null;
  gas_cost: number;
  out_of_pocket: number;
}

export interface PricingResponse {
  product_id: string;
  prices: PriceResult[];
  cached: boolean;
  fetched_at: string;
}
