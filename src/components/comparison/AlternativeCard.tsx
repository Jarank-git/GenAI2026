"use client";

import { useState } from "react";
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
          {"\u2605"}
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
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-stretch gap-3 p-4">
        <div className="flex w-8 shrink-0 items-center justify-center text-lg font-bold text-gray-300">
          #{rank}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {product.store_url ? (
                <a
                  href={product.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                    {product.product_name}
                  </p>
                  <svg className="h-3 w-3 shrink-0 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              ) : (
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.product_name}
                </p>
              )}
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

      {/* AI Reasoning toggle */}
      {product.ai_reasoning && (
        <>
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex w-full items-center justify-between border-t border-gray-100 px-4 py-2 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              AI Analysis
            </span>
            <svg
              className={`h-3 w-3 transition-transform ${showReasoning ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showReasoning && (
            <div className="border-t border-gray-100 bg-emerald-50/50 px-4 py-3">
              <p className="text-xs leading-relaxed text-gray-700">
                {product.ai_reasoning}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
