import type { Product } from "@/types/product";
import type { HyperlocalContext } from "@/types/user-profile";
import type { HyperlocalAdjustment } from "@/types/scoring";

export async function calculateAdjustments(
  product: Product,
  context: HyperlocalContext,
): Promise<HyperlocalAdjustment[]> {
  const adjustments: HyperlocalAdjustment[] = [];

  const waterAdj = calculateWaterAdjustment(product, context);
  if (waterAdj) adjustments.push(waterAdj);

  const recyclingAdj = calculateRecyclingAdjustment(product, context);
  if (recyclingAdj) adjustments.push(recyclingAdj);

  const seasonalAdj = calculateSeasonalAdjustment(product, context);
  if (seasonalAdj) adjustments.push(seasonalAdj);

  const gridAdj = calculateGridAdjustment(product, context);
  if (gridAdj) adjustments.push(gridAdj);

  return adjustments;
}

function calculateWaterAdjustment(
  product: Product,
  context: HyperlocalContext,
): HyperlocalAdjustment | null {
  if (product.category !== "food_beverage") return null;

  const { level, basin } = context.water_stress;

  if (level === "very_high") {
    return {
      type: "water_stress",
      penalty_points: -15,
      reason: `Water-intensive product in a very high water stress area (${basin})`,
    };
  }

  if (level === "high") {
    return {
      type: "water_stress",
      penalty_points: -10,
      reason: `Water-intensive product in a high water stress area (${basin})`,
    };
  }

  return null;
}

function calculateRecyclingAdjustment(
  product: Product,
  context: HyperlocalContext,
): HyperlocalAdjustment | null {
  const packagingByCategory: Record<string, string[]> = {
    food_beverage: ["#1 PET", "#2 HDPE", "glass", "aluminum", "cartons", "tetrapak"],
    cleaning: ["#2 HDPE", "#4 LDPE", "#5 PP"],
    personal_care: ["#1 PET", "#2 HDPE", "#5 PP", "#6 PS"],
    clothing: ["#4 LDPE", "cardboard"],
    electronics: ["#6 PS", "styrofoam", "cardboard"],
    home_goods: ["#5 PP", "#7 Other", "cardboard"],
  };

  const typicalPackaging = packagingByCategory[product.category] ?? [];
  const accepted = context.recycling.accepted_materials;

  const nonRecyclable = typicalPackaging.filter(
    (material) => !accepted.includes(material),
  );

  if (nonRecyclable.length === 0) return null;

  const ratio = nonRecyclable.length / typicalPackaging.length;

  if (ratio > 0.5) {
    return {
      type: "recycling",
      penalty_points: -20,
      reason: `Most packaging materials (${nonRecyclable.join(", ")}) are not accepted in local recycling`,
    };
  }

  if (ratio > 0) {
    return {
      type: "recycling",
      penalty_points: -15,
      reason: `Some packaging materials (${nonRecyclable.join(", ")}) are not accepted in local recycling`,
    };
  }

  return null;
}

function calculateSeasonalAdjustment(
  product: Product,
  context: HyperlocalContext,
): HyperlocalAdjustment | null {
  if (product.category !== "food_beverage") return null;

  const seasonalProduce = context.seasonal_produce;
  if (seasonalProduce.length === 0) return null;

  const productName = product.product_name.toLowerCase();

  const isLocal = seasonalProduce.some((item) => {
    const itemLower = item.toLowerCase();
    return itemLower.includes(productName) || productName.includes(itemLower);
  });

  if (isLocal) return null;

  const isFreshProduce = /fruit|vegetable|berry|berries|apple|tomato|lettuce|corn|pepper|cucumber|peach|pear|grape|melon|strawberr|blueberr|raspberr/i.test(
    productName,
  );

  if (isFreshProduce) {
    return {
      type: "seasonal",
      penalty_points: -20,
      reason: `${product.product_name} is out of season and likely imported long-distance`,
    };
  }

  // Non-produce food items (pasta, peanut butter, etc.) are not penalized for seasonality
  return null;
}

function calculateGridAdjustment(
  product: Product,
  context: HyperlocalContext,
): HyperlocalAdjustment | null {
  if (product.category !== "electronics" && product.category !== "cleaning") {
    return null;
  }

  const gco2 = context.grid_intensity.gco2_per_kwh;

  if (gco2 > 400) {
    return {
      type: "grid_carbon",
      penalty_points: -10,
      reason: `High-carbon electricity grid (${gco2} gCO2/kWh) increases lifecycle emissions`,
    };
  }

  if (gco2 > 200) {
    return {
      type: "grid_carbon",
      penalty_points: -5,
      reason: `Moderate-carbon electricity grid (${gco2} gCO2/kWh) affects lifecycle emissions`,
    };
  }

  return null;
}
