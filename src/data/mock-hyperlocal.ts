import type { HyperlocalContext } from "@/types/user-profile";

export const MOCK_CONTEXTS: Record<string, HyperlocalContext> = {
  toronto: {
    grid_intensity: {
      gco2_per_kwh: 25,
      generation_mix: { nuclear: 55, hydro: 25, natural_gas: 10, wind: 7, solar: 2, biomass: 1 },
    },
    water_stress: {
      index: 0.35,
      level: "medium",
      basin: "Lake Ontario",
    },
    recycling: {
      accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
      source: "City of Toronto Blue Bin program",
    },
    seasonal_produce: ["stored apples", "maple syrup", "stored potatoes", "stored carrots", "stored cabbage"],
    gas_price: {
      price_per_litre: 1.65,
      source: "Mock — GasBuddy Toronto average",
      last_updated: "2026-03-14",
    },
  },
  calgary: {
    grid_intensity: {
      gco2_per_kwh: 370,
      generation_mix: { natural_gas: 64, coal: 4, wind: 18, hydro: 6, solar: 4, other: 4 },
    },
    water_stress: {
      index: 0.65,
      level: "high",
      basin: "Bow River",
    },
    recycling: {
      accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "cardboard", "aluminum", "steel", "paper"],
      source: "City of Calgary Blue Cart program",
    },
    seasonal_produce: ["stored potatoes", "stored carrots", "stored beets", "stored cabbage"],
    gas_price: {
      price_per_litre: 1.55,
      source: "Mock — GasBuddy Calgary average",
      last_updated: "2026-03-14",
    },
  },
  vancouver: {
    grid_intensity: {
      gco2_per_kwh: 10,
      generation_mix: { hydro: 91, natural_gas: 5, biomass: 2, wind: 1, other: 1 },
    },
    water_stress: {
      index: 0.15,
      level: "low",
      basin: "Metro Vancouver Watershed",
    },
    recycling: {
      accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "#6 PS", "#7 Other", "glass", "cardboard", "aluminum", "steel", "paper", "cartons", "tetrapak", "styrofoam"],
      source: "Metro Vancouver Recycles program",
    },
    seasonal_produce: ["stored apples", "kale", "stored potatoes", "stored carrots", "early lettuce"],
    gas_price: {
      price_per_litre: 1.85,
      source: "Mock — GasBuddy Vancouver average",
      last_updated: "2026-03-14",
    },
  },
  montreal: {
    grid_intensity: {
      gco2_per_kwh: 1.2,
      generation_mix: { hydro: 95, wind: 4, biomass: 1 },
    },
    water_stress: {
      index: 0.2,
      level: "low",
      basin: "St. Lawrence River",
    },
    recycling: {
      accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
      source: "Ville de Montreal Recycling program",
    },
    seasonal_produce: ["stored apples", "maple syrup", "stored potatoes", "stored carrots"],
    gas_price: {
      price_per_litre: 1.72,
      source: "Mock — GasBuddy Montreal average",
      last_updated: "2026-03-14",
    },
  },
};
