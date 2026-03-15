"use client";

import { useState, useMemo } from "react";
import type { AlternativeProduct, SortMode } from "@/types/alternatives";
import { sortAlternatives } from "@/lib/sorting";
import { calculateRatioStars } from "@/lib/ratio-stars";
import SortBar from "./SortBar";
import ScannedProductCard from "./ScannedProductCard";
import AlternativeCard from "./AlternativeCard";

interface ComparisonViewProps {
  scannedProduct: AlternativeProduct;
  alternatives: AlternativeProduct[];
}

export default function ComparisonView({
  scannedProduct,
  alternatives,
}: ComparisonViewProps) {
  const [activeMode, setActiveMode] = useState<SortMode>("sweet_spot");

  const sortedAlternatives = useMemo(() => {
    const withStars = calculateRatioStars(alternatives);
    return sortAlternatives(withStars, activeMode);
  }, [alternatives, activeMode]);

  return (
    <div className="flex flex-col gap-4">
      <ScannedProductCard product={scannedProduct} />

      <div className="sticky top-0 z-10 bg-gray-50 -mx-1 px-1 border-b border-gray-200">
        <SortBar activeMode={activeMode} onModeChange={setActiveMode} />
      </div>

      <div className="flex flex-col gap-3">
        {sortedAlternatives.map((product, index) => (
          <AlternativeCard
            key={product.product_id}
            product={product}
            mode={activeMode}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
