import type { SustainabilityScore } from "./scoring";
import type { Externality } from "./externality";

export interface ReceiptItem {
  raw_text: string;
  price: number;
  quantity: number;
  matched_product: string | null;
  brand: string | null;
  category: string | null;
  match_confidence: "high" | "medium" | "low";
}

export interface ParsedReceipt {
  store: { name: string; banner: string; date: string; address: string };
  items: ReceiptItem[];
  total: number;
}

export interface AnalyzedReceiptItem extends ReceiptItem {
  sustainability: SustainabilityScore | null;
  externality: Externality | null;
}

export interface SustainabilityReceipt {
  receipt: ParsedReceipt;
  analyzed_items: AnalyzedReceiptItem[];
  total_spent: number;
  total_cost_with_externalities: number;
  overall_score: number;
  optimized_basket: OptimizedBasket | null;
}

export interface OptimizedBasket {
  swaps: SwapRecommendation[];
  new_total_score: number;
  new_total_cost: number;
  externality_savings: number;
}

export interface SwapRecommendation {
  original: string;
  replacement: string;
  replacement_brand: string;
  store: string;
  score_improvement: number;
  cost_difference: number;
}
