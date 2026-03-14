"use client";

import type { OptimizedBasket } from "@/types/receipt";
import SwapCard from "./SwapCard";

interface OptimizedBasketViewProps {
  basket: OptimizedBasket;
  currentScore: number;
  currentCost: number;
}

export default function OptimizedBasketView({
  basket,
  currentScore,
  currentCost,
}: OptimizedBasketViewProps) {
  const scoreDiff = basket.new_total_score - currentScore;
  const costDiff = basket.new_total_cost - currentCost;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <h3 className="text-sm font-semibold text-green-900">
          If you swapped {basket.swaps.length} items:
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-green-700">New Score</p>
            <p className="text-xl font-bold text-green-800">
              {basket.new_total_score}/100
            </p>
            <p className="text-xs text-green-600">
              {scoreDiff > 0 ? "+" : ""}
              {scoreDiff} pts
            </p>
          </div>
          <div>
            <p className="text-xs text-green-700">New Cost</p>
            <p className="text-xl font-bold text-green-800">
              ${basket.new_total_cost.toFixed(2)}
            </p>
            <p className="text-xs text-green-600">
              {costDiff >= 0 ? "+" : "-"}${Math.abs(costDiff).toFixed(2)}
            </p>
          </div>
        </div>
        {basket.externality_savings > 0 && (
          <p className="mt-2 text-xs text-green-700">
            Save ${basket.externality_savings.toFixed(2)} in externality costs
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {basket.swaps.map((swap, index) => (
          <SwapCard key={index} swap={swap} />
        ))}
      </div>
    </div>
  );
}
