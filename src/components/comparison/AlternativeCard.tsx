"use client";

import type { AlternativeProduct, SortMode } from "@/types/alternatives";

interface AlternativeCardProps {
  product: AlternativeProduct;
  mode: SortMode;
  rank: number;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-lime-600 bg-lime-50";
  if (score >= 40) return "text-yellow-600 bg-yellow-50";
  if (score >= 20) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-lime-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-yellow-500 tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "opacity-100" : "opacity-25"}>
          \u2605
        </span>
      ))}
    </span>
  );
}

function ConfidenceTag({ confidence }: { confidence: string }) {
  if (confidence === "verified") {
    return (
      <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
        Verified
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
      Web Est.
    </span>
  );
}

export default function AlternativeCard({ product, mode, rank }: AlternativeCardProps) {
  return (
    <div className="flex items-stretch gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex w-8 shrink-0 items-center justify-center text-lg font-bold text-gray-300">
        #{rank}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {product.product_name}
            </p>
            <p className="text-xs text-gray-500">
              {product.brand} &middot; {product.store_name}
            </p>
          </div>
          <ConfidenceTag confidence={product.price_confidence} />
        </div>

        {mode === "green" && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${scoreColor(product.sustainability_score)} px-2 py-0.5 rounded-lg`}>
                {product.sustainability_score}
              </span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <span className="text-sm text-gray-500">${product.out_of_pocket.toFixed(2)}</span>
          </div>
        )}

        {mode === "budget" && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-gray-900">
              ${product.out_of_pocket.toFixed(2)}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${scoreBgColor(product.sustainability_score)} text-white`}>
              {product.sustainability_score}
            </span>
          </div>
        )}

        {mode === "sweet_spot" && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Stars count={product.ratio_stars} />
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${scoreColor(product.sustainability_score)}`}>
                {product.sustainability_score}
              </span>
            </div>
            <span className="text-sm text-gray-500">${product.total_cost.toFixed(2)}</span>
          </div>
        )}

        {mode === "planet_pick" && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-red-600">
              +${product.externality_cost.toFixed(2)}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${scoreBgColor(product.sustainability_score)} text-white`}>
              {product.sustainability_score}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
          {product.distance_km !== null && (
            <span>{product.distance_km} km away</span>
          )}
          <span>Gas: ${product.gas_cost.toFixed(2)}</span>
          <span>Ext: ${product.externality_cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
