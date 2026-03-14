import type { PriceResult } from "@/types/pricing";
import type { VehicleProfile } from "@/types/user-profile";

const DEFAULT_KWH_PRICE = 0.13;

const MOCK_STORE_DISTANCES: Record<string, number> = {
  loblaws: 4.2,
  nofrills: 6.8,
  superstore: 11.5,
  walmart: 8.3,
  metro: 2.9,
  sobeys: 5.1,
};

export function calculateGasCost(
  distanceKm: number,
  vehicle: VehicleProfile | "transit" | "bike",
  gasPricePerLitre: number
): number {
  if (vehicle === "transit" || vehicle === "bike") return 0;

  const roundTripKm = distanceKm * 2;

  if (vehicle.fuel_type === "electric") {
    const kwhPer100km = vehicle.kwh_per_100km ?? 15;
    return Math.round((roundTripKm * kwhPer100km / 100) * DEFAULT_KWH_PRICE * 100) / 100;
  }

  // gasoline, diesel, hybrid all use l_per_100km
  return Math.round((roundTripKm * vehicle.l_per_100km / 100) * gasPricePerLitre * 100) / 100;
}

export function attachGasCosts(
  prices: PriceResult[],
  vehicle: VehicleProfile | "transit" | "bike",
  gasPricePerLitre: number
): PriceResult[] {
  return prices.map((price) => {
    const distanceKm =
      price.distance_km ?? MOCK_STORE_DISTANCES[price.banner.toLowerCase()] ?? 5.0;
    const gasCost = calculateGasCost(distanceKm, vehicle, gasPricePerLitre);

    return {
      ...price,
      distance_km: distanceKm,
      gas_cost: gasCost,
      out_of_pocket: Math.round((price.price + gasCost) * 100) / 100,
    };
  });
}
