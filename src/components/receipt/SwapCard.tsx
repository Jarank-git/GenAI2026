"use client";

import type { SwapRecommendation } from "@/types/receipt";

interface SwapCardProps {
  swap: SwapRecommendation;
}

export default function SwapCard({ swap }: SwapCardProps) {
  const costSign = swap.cost_difference >= 0 ? "+" : "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Current</p>
          <p className="text-sm font-medium text-gray-700">{swap.original}</p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        <div className="flex-1 text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Swap to</p>
          <p className="text-sm font-medium text-green-700">{swap.replacement}</p>
          <p className="text-xs text-gray-500">{swap.replacement_brand}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            +{swap.score_improvement} pts
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            swap.cost_difference > 0
              ? "bg-amber-100 text-amber-800"
              : "bg-green-100 text-green-800"
          }`}>
            {costSign}${Math.abs(swap.cost_difference).toFixed(2)}
          </span>
        </div>
        <span className="text-xs text-gray-400">at {swap.store}</span>
      </div>
    </div>
  );
}
