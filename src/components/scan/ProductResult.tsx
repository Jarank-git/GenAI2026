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

const FACTOR_INFO: Record<
  string,
  { label: string; icon: string; good: string; bad: string }
> = {
  transport: {
    label: "Transport Distance",
    icon: "\u{1F69B}",
    good: "Sourced locally or regionally, low transport emissions",
    bad: "Shipped long distances, high transport carbon footprint",
  },
  packaging: {
    label: "Packaging",
    icon: "\u{1F4E6}",
    good: "Minimal, recyclable, or compostable packaging",
    bad: "Excessive or non-recyclable packaging materials",
  },
  certifications: {
    label: "Certifications",
    icon: "\u2705",
    good: "Certified organic, Fair Trade, B Corp, or similar",
    bad: "No recognized sustainability certifications",
  },
  brand_ethics: {
    label: "Brand Ethics",
    icon: "\u{1F91D}",
    good: "Strong ESG practices, transparent supply chain",
    bad: "Poor labor or environmental track record",
  },
  production: {
    label: "Production Method",
    icon: "\u{1F3ED}",
    good: "Low-impact, efficient, or regenerative processes",
    bad: "High energy, chemical-intensive, or wasteful production",
  },
  end_of_life: {
    label: "End of Life",
    icon: "\u267B\uFE0F",
    good: "Fully recyclable, reusable, or biodegradable",
    bad: "Difficult to recycle, ends up in landfill",
  },
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

function barColor(value: number): string {
  if (value >= 70) return "bg-green-500";
  if (value >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function factorExplanation(value: number, info: { good: string; bad: string }): string {
  if (value >= 70) return info.good;
  if (value >= 40) return `Mixed — some room for improvement`;
  return info.bad;
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
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.coordinates) {
      setUserCoords(profile.coordinates);
    }
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
                {lowestPrice ? `$${lowestPrice.price.toFixed(2)}` : "\u2014"}
              </p>
              {lowestPrice && (
                <p className="mt-1 text-[10px] text-zinc-400 truncate">{lowestPrice.store_name}</p>
              )}
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">True Cost</p>
              <p className="text-2xl font-bold text-red-600">
                {externality ? `$${externality.total_cost.toFixed(2)}` : "\u2014"}
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

          {/* ─── Overview Tab — Score Breakdown ─── */}
          {activeTab === "overview" && scoring && (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {/* Score summary */}
              <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This score is a weighted average of 6 sustainability factors, adjusted for your location.
                  {scoring.base_score !== scoring.final_score && (
                    <span> Base score was <strong>{scoring.base_score}</strong>, adjusted to <strong>{scoring.final_score}</strong> by local factors.</span>
                  )}
                </p>
              </div>

              <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Factor Scores</h3>
              <div className="space-y-1">
                {(Object.keys(FACTOR_INFO) as Array<keyof typeof FACTOR_INFO>).map((key) => {
                  const info = FACTOR_INFO[key];
                  const value = scoring.factors[key as keyof typeof scoring.factors];
                  const isExpanded = expandedFactor === key;

                  return (
                    <div key={key}>
                      <button
                        onClick={() => setExpandedFactor(isExpanded ? null : key)}
                        className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <span className="text-sm">{info.icon}</span>
                        <span className="w-28 text-xs text-zinc-600 dark:text-zinc-400">{info.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className={`h-2 rounded-full ${barColor(value)}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">{value}</span>
                        <span className="text-[10px] text-zinc-400">{isExpanded ? "\u25B2" : "\u25BC"}</span>
                      </button>
                      {isExpanded && (
                        <div className="ml-8 mb-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            <span className={`font-semibold ${value >= 70 ? "text-green-600" : value >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                              {value >= 70 ? "Good" : value >= 40 ? "Average" : "Needs improvement"}
                            </span>
                            {" \u2014 "}
                            {factorExplanation(value, info)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {scoring.adjustments.length > 0 && (
                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <h4 className="mb-2 text-xs font-semibold text-zinc-500">Location-Based Adjustments</h4>
                  <p className="mb-2 text-[10px] text-zinc-400">These adjustments reflect environmental factors specific to your area.</p>
                  {scoring.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-start justify-between py-1.5 gap-2">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1">{adj.reason}</span>
                      <span className={`text-xs font-semibold whitespace-nowrap ${adj.penalty_points < 0 ? "text-green-600" : "text-red-600"}`}>
                        {adj.penalty_points > 0 ? "-" : "+"}{Math.abs(adj.penalty_points)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Pricing Tab ─── */}
          {activeTab === "pricing" && pricing && (
            <div className="mt-3 space-y-3">
              {/* Gas price info */}
              {pricing.gas_price_per_litre && (
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{"\u26FD"}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Current gas price ({pricing.user_province ?? "ON"})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ${pricing.gas_price_per_litre.toFixed(2)}/L
                  </span>
                </div>
              )}

              {/* Store list */}
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="p-4 pb-2">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Prices at {pricing.prices.length} stores
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Click a store name to view the product listing
                  </p>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {pricing.prices.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div>
                        {p.source_url ? (
                          <a
                            href={p.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1"
                          >
                            <span className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 group-hover:text-emerald-900 group-hover:decoration-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                              {p.store_name}
                            </span>
                            <svg className="h-3 w-3 text-emerald-500 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5L10.5 13.5" />
                            </svg>
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.store_name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.distance_km !== null && (
                            <span className="text-[10px] text-zinc-400">{p.distance_km.toFixed(1)} km</span>
                          )}
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            p.confidence === "verified"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {p.confidence === "verified" ? "\u2713 Verified" : "~ Estimate"}
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

              {/* Google Maps Embed — show route from user to cheapest store */}
              {userCoords && lowestPrice && lowestPrice.distance_km !== null && (
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Route to {lowestPrice.store_name}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {lowestPrice.distance_km.toFixed(1)} km away &middot; Gas cost: ${lowestPrice.gas_cost.toFixed(2)}
                    </p>
                  </div>
                  <iframe
                    className="w-full h-48 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? ""}&origin=${userCoords.lat},${userCoords.lng}&destination=${encodeURIComponent(lowestPrice.store_name + " near me")}&mode=driving`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── Externality Tab ─── */}
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
