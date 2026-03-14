import gridData from "@/data/grid-intensity.json";

interface GridIntensityResult {
  gco2_per_kwh: number;
  generation_mix: Record<string, number>;
}

const data = gridData as Record<string, GridIntensityResult>;

export async function getGridIntensity(province: string): Promise<GridIntensityResult> {
  const key = province.toUpperCase();
  const result = data[key];

  if (!result) {
    return {
      gco2_per_kwh: 100,
      generation_mix: { unknown: 100 },
    };
  }

  return {
    gco2_per_kwh: result.gco2_per_kwh,
    generation_mix: { ...result.generation_mix },
  };
}
