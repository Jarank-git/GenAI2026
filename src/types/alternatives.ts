import type { PriceConfidence } from "./pricing";

export interface AlternativeProduct {
  product_id: string;
  product_name: string;
  brand: string;
  store_name: string;
  banner: string;

  // Four sortable dimensions
  sustainability_score: number;
  shelf_price: number;
  gas_cost: number;
  out_of_pocket: number; // shelf_price + gas_cost
  externality_cost: number;
  total_cost: number; // out_of_pocket + externality_cost
  ratio: number; // sustainability_score / total_cost

  // Metadata
  distance_km: number | null;
  price_confidence: PriceConfidence;
  ratio_stars: number; // 1-5, calculated relative to result set
}

export type SortMode = "green" | "budget" | "sweet_spot" | "planet_pick";
