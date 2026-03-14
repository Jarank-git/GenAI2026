import type { AlternativeProduct } from "@/types/alternatives";

export function calculateRatioStars(
  alternatives: AlternativeProduct[],
): AlternativeProduct[] {
  if (alternatives.length === 0) return [];

  const sorted = [...alternatives].sort((a, b) => b.ratio - a.ratio);

  return sorted.map((product, index) => {
    const percentile = index / alternatives.length;
    let stars: number;
    if (alternatives.length < 5) {
      stars = Math.max(1, 5 - Math.floor(percentile * 5));
    } else {
      if (percentile < 0.2) stars = 5;
      else if (percentile < 0.4) stars = 4;
      else if (percentile < 0.6) stars = 3;
      else if (percentile < 0.8) stars = 2;
      else stars = 1;
    }
    return { ...product, ratio_stars: stars };
  });
}
