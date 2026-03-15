import type { Product } from "./product";
import type { SustainabilityScore } from "./scoring";
import type { Externality } from "./externality";
import type { PriceResult } from "./pricing";

export interface BoundingBox {
  x: number;      // percentage from left (0-100)
  y: number;      // percentage from top (0-100)
  width: number;  // percentage of image width
  height: number; // percentage of image height
}

export interface DetectedProduct {
  bounding_box: BoundingBox;
  ocr_text: string[];
  barcode: string | null;
  detection_confidence: number;
}

export interface IdentifiedShelfProduct {
  detected: DetectedProduct;
  product: Product;
  identification_confidence: number;
}

export interface AnalyzedShelfProduct extends IdentifiedShelfProduct {
  sustainability: SustainabilityScore | null;
  externality: Externality | null;
  price: PriceResult | null;
  is_best_on_shelf: boolean;
}

export type ShelfOverlayMode = "score" | "price" | "ratio";

export interface ShelfScanResult {
  image_url: string;
  products: AnalyzedShelfProduct[];
  best_product_id: string | null;
  scanned_at: string;
}
