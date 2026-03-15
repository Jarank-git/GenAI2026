import type { Product } from "@/types/product";
import type { FactorScores } from "@/types/scoring";

export interface OFFEnrichmentData {
  ecoscore_grade: string | null;
  certifications: string[];
  packaging_materials: string[];
  nova_group: number | null;
}

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "EcoLens/1.0 (https://ecolens.dev)";

export async function enrichWithOFF(
  product: Product,
): Promise<OFFEnrichmentData | null> {
  if (!product.barcode) return null;

  try {
    const res = await fetch(`${OFF_API_BASE}/${product.barcode}.json`, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;

    const ecoscore_grade: string | null = p.ecoscore_grade ?? null;

    const certifications: string[] = [];
    if (p.labels_tags && Array.isArray(p.labels_tags)) {
      for (const label of p.labels_tags) {
        const cleaned = label.replace(/^en:/, "").replace(/-/g, " ");
        certifications.push(cleaned);
      }
    }

    const packaging_materials: string[] = [];
    if (p.packaging_tags && Array.isArray(p.packaging_tags)) {
      for (const pkg of p.packaging_tags) {
        const cleaned = pkg.replace(/^en:/, "").replace(/-/g, " ");
        packaging_materials.push(cleaned);
      }
    }

    const nova_group: number | null =
      typeof p.nova_group === "number" ? p.nova_group : null;

    return { ecoscore_grade, certifications, packaging_materials, nova_group };
  } catch {
    return null;
  }
}

export function calibrateWithOFF(
  factors: FactorScores,
  offData: OFFEnrichmentData,
): FactorScores {
  const calibrated = { ...factors };

  if (offData.ecoscore_grade) {
    const grade = offData.ecoscore_grade.toLowerCase();
    const gradeMap: Record<string, number> = {
      a: 90,
      b: 70,
      c: 50,
      d: 30,
      e: 10,
    };
    const offReference = gradeMap[grade];

    if (offReference !== undefined) {
      const avgGemini =
        (calibrated.transport +
          calibrated.packaging +
          calibrated.certifications +
          calibrated.production +
          calibrated.end_of_life) /
        5;

      const diff = offReference - avgGemini;

      if (Math.abs(diff) > 15) {
        const adjustment = Math.sign(diff) * Math.min(Math.abs(diff) * 0.2, 10);
        calibrated.packaging = clamp(calibrated.packaging + adjustment);
        calibrated.certifications = clamp(calibrated.certifications + adjustment);
        calibrated.production = clamp(calibrated.production + adjustment);
        calibrated.end_of_life = clamp(calibrated.end_of_life + adjustment);
      }
    }
  }

  if (offData.certifications.length > 3 && calibrated.certifications < 60) {
    calibrated.certifications = clamp(calibrated.certifications + 8);
  } else if (
    offData.certifications.length === 0 &&
    calibrated.certifications > 80
  ) {
    calibrated.certifications = clamp(calibrated.certifications - 8);
  }

  if (offData.nova_group !== null) {
    if (offData.nova_group === 1 && calibrated.production < 60) {
      calibrated.production = clamp(calibrated.production + 5);
    } else if (offData.nova_group === 4 && calibrated.production > 60) {
      calibrated.production = clamp(calibrated.production - 5);
    }
  }

  return calibrated;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
