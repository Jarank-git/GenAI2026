export function scoreTransport(
  originCountry: string,
  transportMode: string,
  distanceKm: number,
): number {
  let baseScore: number;

  if (distanceKm < 500) {
    baseScore = 90 + (1 - distanceKm / 500) * 10;
  } else if (distanceKm < 2000) {
    const ratio = (distanceKm - 500) / 1500;
    baseScore = 89 - ratio * 19;
  } else if (distanceKm < 5000) {
    const ratio = (distanceKm - 2000) / 3000;
    baseScore = 69 - ratio * 30;
  } else {
    const ratio = Math.min((distanceKm - 5000) / 10000, 1);
    baseScore = 39 - ratio * 39;
  }

  let modeAdj = 0;
  switch (transportMode.toLowerCase()) {
    case "air":
      modeAdj = -10;
      break;
    case "ship":
      modeAdj = 0;
      break;
    case "truck":
      modeAdj = distanceKm > 2000 ? -5 : 0;
      break;
    case "rail":
      modeAdj = 5;
      break;
  }

  return Math.max(0, Math.min(100, Math.round(baseScore + modeAdj)));
}
