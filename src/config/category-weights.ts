import type { ProductCategory } from "@/types/product";

export interface CategoryWeights {
  transport: number;
  packaging: number;
  certifications: number;
  brand_ethics: number;
  production: number;
  end_of_life: number;
}

export const CATEGORY_WEIGHTS: Record<ProductCategory, CategoryWeights> = {
  food_beverage: {
    transport: 25,
    packaging: 20,
    certifications: 20,
    brand_ethics: 15,
    production: 10,
    end_of_life: 10,
  },
  cleaning: {
    transport: 15,
    packaging: 25,
    certifications: 15,
    brand_ethics: 10,
    production: 25,
    end_of_life: 10,
  },
  personal_care: {
    transport: 15,
    packaging: 20,
    certifications: 20,
    brand_ethics: 15,
    production: 20,
    end_of_life: 10,
  },
  clothing: {
    transport: 15,
    packaging: 5,
    certifications: 15,
    brand_ethics: 30,
    production: 25,
    end_of_life: 10,
  },
  electronics: {
    transport: 10,
    packaging: 10,
    certifications: 10,
    brand_ethics: 15,
    production: 25,
    end_of_life: 30,
  },
  home_goods: {
    transport: 20,
    packaging: 15,
    certifications: 10,
    brand_ethics: 15,
    production: 20,
    end_of_life: 20,
  },
};

export const DEFAULT_CATEGORY: ProductCategory = "food_beverage";
