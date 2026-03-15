import {
  PLASTIC_COST_PER_GRAM,
  LANDFILL_MULTIPLIER,
} from "@/config/externality-pricing";
import type { PackagingMaterial } from "@/types/externality";

const MATERIAL_TO_ACCEPTED: Record<string, string> = {
  PET_1: "#1 PET",
  HDPE_2: "#2 HDPE",
  PVC_3: "#3 PVC",
  LDPE_4: "#4 LDPE",
  PP_5: "#5 PP",
  PS_6: "#6 PS",
  OTHER_7: "#7 Other",
  cardboard: "cardboard",
  glass: "glass",
  aluminum: "aluminum",
};

export function calculatePackagingCost(
  packaging: Array<{ material: string; grams: number }>,
  acceptedMaterials: string[],
): { cost: number; materials: PackagingMaterial[] } {
  const acceptedLower = acceptedMaterials.map((m) => m.toLowerCase());

  const materials: PackagingMaterial[] = packaging.map((pkg) => {
    const costPerGram = PLASTIC_COST_PER_GRAM[pkg.material] ?? 0.0005;
    const acceptedName = MATERIAL_TO_ACCEPTED[pkg.material] ?? pkg.material;
    const recyclableLocally = acceptedLower.includes(acceptedName.toLowerCase());

    let cost = pkg.grams * costPerGram;
    if (!recyclableLocally) {
      cost *= LANDFILL_MULTIPLIER;
    }
    cost = Math.round(cost * 100) / 100;

    return {
      material: pkg.material,
      grams: pkg.grams,
      cost,
      recyclable_locally: recyclableLocally,
    };
  });

  const totalCost =
    Math.round(materials.reduce((sum, m) => sum + m.cost, 0) * 100) / 100;

  return { cost: totalCost, materials };
}
