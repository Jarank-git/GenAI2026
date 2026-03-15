import type { Product } from "@/types/product";
import type { PricingResponse } from "@/types/pricing";
import type { UserProfile } from "@/types/user-profile";
import { queryAllBanners } from "@/services/pricing/pc-express";
import { queryNonLoblawStores } from "@/services/pricing/grounded-search";
import { aggregatePrices } from "@/services/pricing/aggregator";
import { getCachedPrices, cachePrices } from "@/services/pricing/cache";
import { attachGasCosts } from "@/services/pricing/gas-cost";
import { getGasPrice } from "@/services/hyperlocal/gas-price";

export async function fetchAllPrices(
  product: Product,
  userProfile: UserProfile
): Promise<PricingResponse> {
  const cached = getCachedPrices(product.product_id);
  if (cached) {
    return {
      product_id: product.product_id,
      prices: cached,
      cached: true,
      fetched_at: new Date().toISOString(),
    };
  }

  const postalCode = userProfile.postal_code ?? "M5V 1J2";

  // Layer 1: PC Express (Loblaw banners — verified prices)
  // Layer 2: Flipp API (non-Loblaw stores — flyer/sale prices)
  const [layer1Results, layer2Results] = await Promise.all([
    queryAllBanners(product.product_name),
    queryNonLoblawStores(product.product_name, userProfile.city, postalCode),
  ]);

  const aggregated = aggregatePrices(layer1Results, layer2Results);

  const gasData = await getGasPrice(userProfile.province, userProfile.city);

  const withGasCosts = attachGasCosts(
    aggregated,
    userProfile.vehicle,
    gasData.price_per_litre
  );

  cachePrices(product.product_id, withGasCosts, 1);

  return {
    product_id: product.product_id,
    prices: withGasCosts,
    cached: false,
    fetched_at: new Date().toISOString(),
  };
}
