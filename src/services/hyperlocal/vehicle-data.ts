import type { VehicleProfile } from "@/types/user-profile";
import vehicleData from "@/data/nrcan-vehicles.json";

interface VehicleEntry {
  make: string;
  model: string;
  year: number;
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid";
  l_per_100km: number;
  kwh_per_100km?: number;
}

const vehicles: VehicleEntry[] = vehicleData as VehicleEntry[];

export async function lookupVehicle(
  make: string,
  model: string,
  year: number,
): Promise<VehicleProfile | null> {
  const match = vehicles.find(
    (v) =>
      v.make.toLowerCase() === make.toLowerCase() &&
      v.model.toLowerCase() === model.toLowerCase() &&
      v.year === year,
  );

  if (!match) return null;

  return {
    make: match.make,
    model: match.model,
    year: match.year,
    fuel_type: match.fuel_type,
    l_per_100km: match.l_per_100km,
    kwh_per_100km: match.kwh_per_100km,
  };
}

export async function getAvailableMakes(): Promise<string[]> {
  const makes = new Set(vehicles.map((v) => v.make));
  return Array.from(makes).sort();
}

export async function getModelsForMake(make: string): Promise<string[]> {
  const models = new Set(
    vehicles
      .filter((v) => v.make.toLowerCase() === make.toLowerCase())
      .map((v) => v.model),
  );
  return Array.from(models).sort();
}

export async function getYearsForModel(make: string, model: string): Promise<number[]> {
  const years = vehicles
    .filter(
      (v) =>
        v.make.toLowerCase() === make.toLowerCase() &&
        v.model.toLowerCase() === model.toLowerCase(),
    )
    .map((v) => v.year);
  return Array.from(new Set(years)).sort((a, b) => b - a);
}
