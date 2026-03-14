import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/user-profile";
import type { Externality } from "@/types/externality";
import { buildHyperlocalContext } from "@/services/hyperlocal";
import { researchLifecycle } from "@/services/externality/lifecycle";
import { calculateCarbonCost } from "@/services/externality/carbon";
import { calculateWaterCost } from "@/services/externality/water";
import { calculatePackagingCost } from "@/services/externality/packaging";
import {
  calculateLandUseCost,
  calculateEutrophicationCost,
} from "@/services/externality/land-use";

interface CacheEntry {
  data: Externality;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, CacheEntry>();

function getCacheKey(productId: string, postalCode: string): string {
  return `externality:${productId}:${postalCode}`;
}

export async function calculateTotalExternality(
  product: Product,
  userProfile: UserProfile,
  shelfPrice?: number,
  gasCost?: number,
): Promise<Externality> {
  const cacheKey = getCacheKey(product.product_id, userProfile.postal_code);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    // Recalculate total_cost since shelf price / gas cost may differ
    const externality = { ...cached.data };
    externality.total_cost =
      (shelfPrice ?? 0) + (gasCost ?? 0) + externality.externality_cost;
    return externality;
  }

  const [lifecycle, context] = await Promise.all([
    researchLifecycle(product),
    buildHyperlocalContext(userProfile),
  ]);

  const carbon = calculateCarbonCost(lifecycle.carbon_kg_co2e);
  const water = calculateWaterCost(
    lifecycle.water_litres,
    context.water_stress.level,
  );
  const packaging = calculatePackagingCost(
    lifecycle.packaging,
    context.recycling.accepted_materials,
  );
  const landUse = calculateLandUseCost(
    lifecycle.land_use_m2,
    lifecycle.land_use_commodity,
  );
  const eutrophication = calculateEutrophicationCost(
    lifecycle.eutrophication_index,
  );

  const externality_cost =
    Math.round(
      (carbon.cost +
        water.cost +
        packaging.cost +
        landUse.cost +
        eutrophication.cost) *
        100,
    ) / 100;

  const total_cost =
    Math.round(
      ((shelfPrice ?? 0) + (gasCost ?? 0) + externality_cost) * 100,
    ) / 100;

  const result: Externality = {
    product_id: product.product_id,
    externality_cost,
    breakdown: {
      carbon,
      water,
      packaging,
      land_use: landUse,
      eutrophication,
    },
    total_cost,
  };

  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}
