"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import type { SustainabilityScore } from "@/types/scoring";
import type { Externality } from "@/types/externality";
import type { PricingResponse } from "@/types/pricing";
import ExternalityBreakdown from "@/components/externality/ExternalityBreakdown";
import { loadProfile } from "@/lib/profile-storage";

interface ProductResultProps {
  product: Product;
  onScanAnother: () => void;
}

const categoryLabels: Record<string, string> = {
  food_beverage: "Food & Beverage",
  cleaning: "Cleaning",
  personal_care: "Personal Care",
  clothing: "Clothing",
  electronics: "Electronics",
  home_goods: "Home Goods",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-lime-600";
  if (score >= 40) return "text-yellow-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-lime-100 text-lime-800";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  if (score >= 20) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function confidenceBadge(confidence: number) {
  if (confidence >= 0.9) {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        High confidence
      </span>
    );
  }
  if (confidence >= 0.7) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Medium confidence
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Low confidence
    </span>
  );
}

type AnalysisState = "loading" | "loaded" | "error";

export default function ProductResult({
  product,
  onScanAnother,
}: ProductResultProps) {
  const [scoring, setScoring] = useState<SustainabilityScore | null>(null);
  const [externality, setExternality] = useState<Externality | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [scoringState, setScoringState] = useState<AnalysisState>("loading");
  const [externalityState, setExternalityState] = useState<AnalysisState>("loading");
  const [pricingState, setPricingState] = useState<AnalysisState>("loading");
  const [activeTab, setActiveTab] = useState<"overview" | "pricing" | "externality">("overview");

  useEffect(() => {
    const profile = loadProfile();
    const body = JSON.stringify({ product, userProfile: profile ?? undefined });
    const headers = { "Content-Type": "application/json" };

    fetch("/api/score", { method: "POST", headers, body })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setScoring(data);
        setScoringState("loaded");
      })
      .catch(() => setScoringState("error"));

    fetch("/api/pricing", { method: "POST", headers, body })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPricing(data);
        setPricingState("loaded");
        return data;
      })
      .then((pricingData) => {
        // Chain externality fetch after pricing so we have the shelf price
        const bestPrice = pricingData.prices?.[0]?.price;
        const extBody = JSON.stringify({
          product,
          userProfile: profile ?? undefined,
          shelfPrice: bestPrice,
        });
        return fetch("/api/externality", { method: "POST", headers, body: extBody })
          .then((r) => r.json())
          .then((data) => {
            if (data.error) throw new Error(data.error);
            setExternality(data);
            setExternalityState("loaded");
          })
          .catch(() => setExternalityState("error"));
      })
      .catch(() => {
        setPricingState("error");
        setExternalityState("error");
      });
  }, [product]);

  const isLoading =
    scoringState === "loading" ||
    pricingState === "loading" ||
    externalityState === "loading";

  const lowestPrice = pricing?.prices?.[0];

  return (
    <div className="w-full max-w-md">
      {/* Product Identity Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {product.product_name}
            </h2>
            <p className="text-sm text-zinc-500">{product.brand} · {categoryLabels[product.category]} · {product.weight_volume}</p>
          </div>
          {confidenceBadge(product.confidence)}
        </div>

        {/* Score + Quick Stats */}
        {scoringState === "loaded" && scoring ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Score</p>
              <p className={`text-2xl font-bold ${scoreColor(scoring.final_score)}`}>
                {scoring.final_score}
              </p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${scoreBgColor(scoring.final_score)}`}>
                {scoring.label}
              </span>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Best Price</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {lowestPrice ? `$${lowestPrice.price.toFixed(2)}` : "—"}
              </p>
              {lowestPrice && (
                <p className="mt-1 text-[10px] text-zinc-400 truncate">{lowestPrice.store_name}</p>
              )}
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">True Cost</p>
              <p className="text-2xl font-bold text-red-600">
                {externality ? `$${externality.total_cost.toFixed(2)}` : "—"}
              </p>
              {externality && (
                <p className="mt-1 text-[10px] text-red-400">+${externality.externality_cost.toFixed(2)} hidden</p>
              )}
            </div>
          </div>
        ) : scoringState === "loading" ? (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-zinc-50 p-6 dark:bg-zinc-800">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">Analyzing sustainability, pricing & true cost...</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            Analysis could not be completed. Try again later.
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      {!isLoading && (scoringState === "loaded" || pricingState === "loaded" || externalityState === "loaded") && (
        <div className="mt-4">
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {(["overview", "pricing", "externality"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                {tab === "overview" ? "Score Breakdown" : tab === "pricing" ? "Store Prices" : "True Cost"}
              </button>
            ))}
          </div>

          {/* Overview Tab — Score Breakdown */}
          {activeTab === "overview" && scoring && (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Factor Scores</h3>
              <div className="space-y-2.5">
                {([
                  { key: "transport", label: "Transport Distance", icon: "🚛" },
                  { key: "packaging", label: "Packaging", icon: "📦" },
                  { key: "certifications", label: "Certifications", icon: "✅" },
                  { key: "brand_ethics", label: "Brand Ethics", icon: "🤝" },
                  { key: "production", label: "Production Method", icon: "🏭" },
                  { key: "end_of_life", label: "End of Life", icon: "♻️" },
                ] as const).map(({ key, label, icon }) => {
                  const value = scoring.factors[key];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm">{icon}</span>
                      <span className="w-28 text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
                      <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={`h-2 rounded-full ${value >= 70 ? "bg-green-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">{value}</span>
                    </div>
                  );
                })}
              </div>

              {scoring.adjustments.length > 0 && (
                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <h4 className="mb-2 text-xs font-semibold text-zinc-500">Hyperlocal Adjustments</h4>
                  {scoring.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{adj.reason}</span>
                      <span className="text-xs font-semibold text-red-600">{adj.penalty_points} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && pricing && (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Prices at {pricing.prices.length} stores
                </h3>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pricing.prices.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.store_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.distance_km !== null && (
                          <span className="text-[10px] text-zinc-400">{p.distance_km.toFixed(1)} km</span>
                        )}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          p.confidence === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {p.confidence === "verified" ? "✓ Verified" : "~ Estimate"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">${p.price.toFixed(2)}</p>
                      {p.gas_cost > 0 && (
                        <p className="text-[10px] text-zinc-400">+${p.gas_cost.toFixed(2)} gas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Externality Tab */}
          {activeTab === "externality" && externality && (
            <div className="mt-3">
              <ExternalityBreakdown
                externality={externality}
                shelfPrice={lowestPrice?.price}
                gasCost={lowestPrice?.gas_cost}
              />
            </div>
          )}
        </div>
      )}

      <button
        onClick={onScanAnother}
        className="mt-5 w-full rounded-full border border-zinc-300 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Scan another product
      </button>
    </div>
  );
}
