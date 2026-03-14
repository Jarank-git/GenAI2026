export interface ExternalityBreakdown {
  carbon: { cost: number; kg_co2e: number };
  water: { cost: number; litres: number; scarcity_multiplier: number };
  packaging: { cost: number; materials: PackagingMaterial[] };
  land_use: { cost: number; m2: number };
  eutrophication: { cost: number; index: number };
}

export interface PackagingMaterial {
  material: string;
  grams: number;
  cost: number;
  recyclable_locally: boolean;
}

export interface Externality {
  product_id: string;
  externality_cost: number;
  breakdown: ExternalityBreakdown;
  total_cost: number; // shelf_price + gas_cost + externality_cost
}
