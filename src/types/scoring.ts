export interface FactorScores {
  transport: number;
  packaging: number;
  certifications: number;
  brand_ethics: number;
  production: number;
  end_of_life: number;
}

export interface HyperlocalAdjustment {
  type: "water_stress" | "recycling" | "seasonal" | "grid_carbon";
  penalty_points: number;
  reason: string;
}

export interface SustainabilityScore {
  product_id: string;
  base_score: number;
  final_score: number;
  label: ScoreLabel;
  color: ScoreColor;
  factors: FactorScores;
  adjustments: HyperlocalAdjustment[];
}

export type ScoreLabel = "Excellent" | "Good" | "Average" | "Poor" | "Very Poor";
export type ScoreColor = "green" | "yellow-green" | "yellow" | "orange" | "red";
