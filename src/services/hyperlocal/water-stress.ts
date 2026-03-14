import type { WaterStressLevel } from "@/types/user-profile";

interface WaterStressResult {
  index: number;
  level: WaterStressLevel;
  basin: string;
}

interface WaterStressRegion {
  latRange: [number, number];
  lngRange: [number, number];
  index: number;
  level: WaterStressLevel;
  basin: string;
}

// Water stress indices follow WRI Aqueduct scale: LOW (0-1), MEDIUM (1-2), HIGH (2-3), VERY HIGH (3-5)
const WATER_STRESS_REGIONS: WaterStressRegion[] = [
  { latRange: [49, 54], lngRange: [-115, -110], index: 2.6, level: "high", basin: "South Saskatchewan River" },
  { latRange: [49, 52], lngRange: [-110, -100], index: 2.8, level: "high", basin: "Saskatchewan River" },
  { latRange: [49, 52], lngRange: [-100, -96], index: 2.2, level: "high", basin: "Assiniboine River" },
  { latRange: [42, 45], lngRange: [-83, -76], index: 1.4, level: "medium", basin: "Lake Ontario" },
  { latRange: [42, 44], lngRange: [-83, -80], index: 1.6, level: "medium", basin: "Lake Erie" },
  { latRange: [44, 47], lngRange: [-80, -74], index: 1.2, level: "medium", basin: "Ottawa River" },
  { latRange: [45, 48], lngRange: [-74, -70], index: 0.8, level: "low", basin: "St. Lawrence River" },
  { latRange: [48, 50], lngRange: [-125, -122], index: 0.6, level: "low", basin: "Metro Vancouver Watershed" },
  { latRange: [48, 54], lngRange: [-130, -120], index: 0.4, level: "low", basin: "Pacific Coast Watershed" },
  { latRange: [46, 48], lngRange: [-67, -60], index: 0.8, level: "low", basin: "Bay of Fundy Watershed" },
  { latRange: [43, 50], lngRange: [-57, -52], index: 0.6, level: "low", basin: "Newfoundland Watershed" },
];

export async function getWaterStress(lat: number, lng: number): Promise<WaterStressResult> {
  for (const region of WATER_STRESS_REGIONS) {
    if (
      lat >= region.latRange[0] &&
      lat <= region.latRange[1] &&
      lng >= region.lngRange[0] &&
      lng <= region.lngRange[1]
    ) {
      return {
        index: region.index,
        level: region.level,
        basin: region.basin,
      };
    }
  }

  return {
    index: 0.5,
    level: "low",
    basin: "Unknown Basin",
  };
}
