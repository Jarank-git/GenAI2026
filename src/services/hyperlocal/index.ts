import type { UserProfile, HyperlocalContext } from "@/types/user-profile";
import { getGridIntensity } from "./grid-emissions";
import { getWaterStress } from "./water-stress";
import { getRecyclingCapabilities } from "./recycling";
import { getSeasonalProduce } from "./seasonal";
import { getGasPrice } from "./gas-price";

export async function buildHyperlocalContext(
  profile: UserProfile,
): Promise<HyperlocalContext> {
  // Each individual service handles its own mock/real toggle,
  // so we always call them directly
  const [gridIntensity, waterStress, recycling, seasonalProduce, gasPrice] =
    await Promise.all([
      getGridIntensity(profile.province),
      getWaterStress(profile.coordinates.lat, profile.coordinates.lng),
      getRecyclingCapabilities(profile.postal_code, profile.city),
      getSeasonalProduce(profile.province),
      getGasPrice(profile.province, profile.city),
    ]);

  return {
    grid_intensity: gridIntensity,
    water_stress: waterStress,
    recycling,
    seasonal_produce: seasonalProduce,
    gas_price: gasPrice,
  };
}

export { geocodePostalCode, validatePostalCode } from "./geocoding";
export { lookupVehicle, getAvailableMakes, getModelsForMake, getYearsForModel } from "./vehicle-data";
export { getGasPrice } from "./gas-price";
export { getGridIntensity } from "./grid-emissions";
export { getWaterStress } from "./water-stress";
export { getRecyclingCapabilities } from "./recycling";
export { getSeasonalProduce, isInSeason } from "./seasonal";
export { calculateAdjustments } from "./adjustments";
