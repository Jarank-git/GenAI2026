import type { AlternativeProduct, SortMode } from "@/types/alternatives";

function tieBreaker(a: AlternativeProduct, b: AlternativeProduct): number {
  return b.sustainability_score - a.sustainability_score;
}

export function sortByGreen(alternatives: AlternativeProduct[]): AlternativeProduct[] {
  return [...alternatives].sort((a, b) => {
    const diff = b.sustainability_score - a.sustainability_score;
    return diff !== 0 ? diff : 0;
  });
}

export function sortByBudget(alternatives: AlternativeProduct[]): AlternativeProduct[] {
  return [...alternatives].sort((a, b) => {
    const aValid = a.shelf_price > 0;
    const bValid = b.shelf_price > 0;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    if (!aValid && !bValid) return tieBreaker(a, b);
    const diff = a.out_of_pocket - b.out_of_pocket;
    return diff !== 0 ? diff : tieBreaker(a, b);
  });
}

export function sortBySweetSpot(alternatives: AlternativeProduct[]): AlternativeProduct[] {
  return [...alternatives].sort((a, b) => {
    const aValid = a.shelf_price > 0;
    const bValid = b.shelf_price > 0;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    if (!aValid && !bValid) return tieBreaker(a, b);
    const diff = b.ratio - a.ratio;
    return diff !== 0 ? diff : tieBreaker(a, b);
  });
}

export function sortByPlanetPick(alternatives: AlternativeProduct[]): AlternativeProduct[] {
  return [...alternatives].sort((a, b) => {
    const aValid = a.externality_cost > 0;
    const bValid = b.externality_cost > 0;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    if (!aValid && !bValid) return tieBreaker(a, b);
    const diff = a.externality_cost - b.externality_cost;
    return diff !== 0 ? diff : tieBreaker(a, b);
  });
}

export function sortAlternatives(
  alternatives: AlternativeProduct[],
  mode: SortMode,
): AlternativeProduct[] {
  switch (mode) {
    case "green":
      return sortByGreen(alternatives);
    case "budget":
      return sortByBudget(alternatives);
    case "sweet_spot":
      return sortBySweetSpot(alternatives);
    case "planet_pick":
      return sortByPlanetPick(alternatives);
  }
}
