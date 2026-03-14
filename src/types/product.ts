export interface Product {
  product_id: string;
  product_name: string;
  brand: string;
  category: ProductCategory;
  weight_volume: string;
  barcode: string | null;
  image_url: string | null;
  confidence: number;
  open_food_facts_match: boolean;
}

export type ProductCategory =
  | "food_beverage"
  | "cleaning"
  | "personal_care"
  | "clothing"
  | "electronics"
  | "home_goods";

export interface CloudinaryOutput {
  image_url: string;
  barcode: string | null;
  ocr_text: string[];
  brand_detected: string | null;
  confidence: number;
}
