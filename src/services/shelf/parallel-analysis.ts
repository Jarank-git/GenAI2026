import type { IdentifiedShelfProduct, AnalyzedShelfProduct } from "@/types/shelf";
import type { UserProfile } from "@/types/user-profile";
import { scoreProduct } from "@/orchestrators/scoring-pipeline";
import { calculateTotalExternality } from "@/orchestrators/externality-pipeline";
import { mockAnalyzedProducts } from "@/data/mock-shelf";

export async function analyzeShelfProducts(
  identified: IdentifiedShelfProduct[],
  userProfile: UserProfile
): Promise<AnalyzedShelfProduct[]> {
  const useMock = !process.env.GEMINI_API_KEY;

  if (useMock) {
    return mockAnalyzedProducts;
  }

  const analyzed = await Promise.all(
    identified.map(async (item): Promise<AnalyzedShelfProduct> => {
      const [sustainability, externality] = await Promise.all([
        scoreProduct(item.product, userProfile).catch(() => null),
        calculateTotalExternality(item.product, userProfile).catch(() => null),
      ]);

      return {
        ...item,
        sustainability,
        externality,
        price: null,
        is_best_on_shelf: false,
      };
    })
  );

  let bestIndex = -1;
  let bestScore = -1;
  for (let i = 0; i < analyzed.length; i++) {
    const score = analyzed[i].sustainability?.final_score ?? -1;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex >= 0) {
    analyzed[bestIndex].is_best_on_shelf = true;
  }

  return analyzed;
}
