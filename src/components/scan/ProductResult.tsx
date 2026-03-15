"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import type { SustainabilityScore } from "@/types/scoring";
import type { Externality } from "@/types/externality";
import type { PricingResponse, PriceResult } from "@/types/pricing";
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

/* ── Factor metadata with tiered explanations ── */
const FACTORS: {
  key: keyof import("@/types/scoring").FactorScores;
  label: string;
  icon: string;
  tiers: [string, string, string]; // [good >=70, mixed 40-69, bad <40]
}[] = [
  {
    key: "transport",
    label: "Transport",
    icon: "\u{1F69B}",
    tiers: [
      "Produced nearby \u2014 low shipping emissions",
      "Moderate distance \u2014 some shipping emissions",
      "Shipped very far \u2014 high carbon from transport",
    ],
  },
  {
    key: "packaging",
    label: "Packaging",
    icon: "\u{1F4E6}",
    tiers: [
      "Minimal or recyclable packaging",
      "Some non-recyclable materials",
      "Heavy or non-recyclable packaging",
    ],
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: "\u2705",
    tiers: [
      "Certified organic, Fair Trade, or equivalent",
      "Some certifications present",
      "No sustainability certifications found",
    ],
  },
  {
    key: "brand_ethics",
    label: "Brand Ethics",
    icon: "\u{1F91D}",
    tiers: [
      "Strong transparency & ethical practices",
      "Mixed record on ethics & supply chain",
      "Concerns about labor or environment",
    ],
  },
  {
    key: "production",
    label: "Production",
    icon: "\u{1F3ED}",
    tiers: [
      "Efficient, low-impact manufacturing",
      "Standard industrial production",
      "Energy-intensive or wasteful processes",
    ],
  },
  {
    key: "end_of_life",
    label: "Recyclability",
    icon: "\u267B\uFE0F",
    tiers: [
      "Fully recyclable or compostable",
      "Partially recyclable",
      "Mostly ends up in landfill",
    ],
  },
];

function scoreColor(s: number) {
  if (s >= 80) return "text-green-600";
  if (s >= 60) return "text-lime-600";
  if (s >= 40) return "text-yellow-600";
  if (s >= 20) return "text-orange-600";
  return "text-red-600";
}
function scoreBg(s: number) {
  if (s >= 80) return "bg-green-100 text-green-800";
  if (s >= 60) return "bg-lime-100 text-lime-800";
  if (s >= 40) return "bg-yellow-100 text-yellow-800";
  if (s >= 20) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}
function barBg(v: number) {
  if (v >= 70) return "bg-green-500";
  if (v >= 40) return "bg-yellow-500";
  return "bg-red-500";
}
function tierText(v: number, tiers: [string, string, string]) {
  if (v >= 70) return tiers[0];
  if (v >= 40) return tiers[1];
  return tiers[2];
}

function ExternalLinkIcon() {
  return (
    <svg className="inline h-3 w-3 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5L10.5 13.5" />
    </svg>
  );
}

/* ── Store row with link, distance, gas, total ── */
function StoreRow({ p, isLowest }: { p: PriceResult; isLowest: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${isLowest ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isLowest && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Best</span>}
          {p.source_url ? (
            <a href={p.source_url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-emerald-700 underline decoration-emerald-200 underline-offset-2 hover:text-emerald-900 hover:decoration-emerald-400 dark:text-emerald-400 truncate">
              {p.store_name}<ExternalLinkIcon />
            </a>
          ) : (
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{p.store_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {p.distance_km !== null && (
            <span className="text-[10px] text-zinc-400">{p.distance_km.toFixed(1)} km</span>
          )}
          {p.gas_cost > 0 && (
            <span className="text-[10px] text-zinc-400">+${p.gas_cost.toFixed(2)} gas</span>
          )}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            p.confidence === "verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {p.confidence === "verified" ? "\u2713 Verified" : "~ Estimate"}
          </span>
        </div>
      </div>
      <div className="text-right pl-3">
        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">${p.price.toFixed(2)}</p>
        <p className="text-[10px] text-zinc-400">${p.out_of_pocket.toFixed(2)} total</p>
      </div>
    </div>
  );
}

type Tab = "overview" | "pricing" | "externality";
type State = "loading" | "loaded" | "error";

export default function ProductResult({ product, onScanAnother }: ProductResultProps) {
  const [scoring, setScoring] = useState<SustainabilityScore | null>(null);
  const [externality, setExternality] = useState<Externality | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [sState, setSState] = useState<State>("loading");
  const [eState, setEState] = useState<State>("loading");
  const [pState, setPState] = useState<State>("loading");
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const [mapStore, setMapStore] = useState<PriceResult | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Default to Toronto if no profile saved (matches server-side default)
  const DEFAULT_COORDS = { lat: 43.6426, lng: -79.3871 };

  useEffect(() => {
    const profile = loadProfile();
    setUserCoords(profile?.coordinates ?? DEFAULT_COORDS);
    const body = JSON.stringify({ product, userProfile: profile ?? undefined });
    const h = { "Content-Type": "application/json" };

    fetch("/api/score", { method: "POST", headers: h, body })
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setScoring(d); setSState("loaded"); })
      .catch(() => setSState("error"));

    fetch("/api/pricing", { method: "POST", headers: h, body })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setPricing(d);
        setPState("loaded");
        setMapStore(d.prices?.[0] ?? null);
        return d;
      })
      .then((pd) => {
        const extBody = JSON.stringify({ product, userProfile: profile ?? undefined, shelfPrice: pd.prices?.[0]?.price });
        return fetch("/api/externality", { method: "POST", headers: h, body: extBody })
          .then((r) => r.json())
          .then((d) => { if (d.error) throw new Error(d.error); setExternality(d); setEState("loaded"); })
          .catch(() => setEState("error"));
      })
      .catch(() => { setPState("error"); setEState("error"); });
  }, [product]);

  const loading = sState === "loading" || pState === "loading" || eState === "loading";
  const best = pricing?.prices?.[0];
  const mapsKey = pricing?.maps_api_key;

  return (
    <div className="w-full max-w-md space-y-4">
      {/* ─── Product Header ─── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{product.product_name}</h2>
            <p className="text-sm text-zinc-500">{product.brand} · {categoryLabels[product.category]} · {product.weight_volume}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            product.confidence >= 0.9 ? "bg-emerald-100 text-emerald-800" :
            product.confidence >= 0.7 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
          }`}>
            {product.confidence >= 0.9 ? "High" : product.confidence >= 0.7 ? "Medium" : "Low"} confidence
          </span>
        </div>

        {/* Quick stats row */}
        {sState === "loaded" && scoring ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-zinc-50 p-2.5 text-center dark:bg-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-400">Score</p>
              <p className={`text-2xl font-black ${scoreColor(scoring.final_score)}`}>{scoring.final_score}</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${scoreBg(scoring.final_score)}`}>{scoring.label}</span>
            </div>
            <div className="rounded-xl bg-zinc-50 p-2.5 text-center dark:bg-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-400">Cheapest</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{best ? `$${best.price.toFixed(2)}` : "\u2014"}</p>
              {best && <p className="text-[9px] text-zinc-400 truncate">{best.store_name}</p>}
            </div>
            <div className="rounded-xl bg-zinc-50 p-2.5 text-center dark:bg-zinc-800">
              <p className="text-[9px] uppercase tracking-widest text-zinc-400">True Cost</p>
              <p className="text-2xl font-black text-red-600">{externality ? `$${externality.total_cost.toFixed(2)}` : "\u2014"}</p>
              {externality && <p className="text-[9px] text-red-400">+${externality.externality_cost.toFixed(2)} hidden</p>}
            </div>
          </div>
        ) : sState === "loading" ? (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-zinc-50 p-6 dark:bg-zinc-800">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">Analyzing...</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            Analysis unavailable
          </div>
        )}
      </div>

      {/* ─── Tabs ─── */}
      {!loading && (sState === "loaded" || pState === "loaded") && (
        <>
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {([
              ["overview", "Why This Score"],
              ["pricing", "Where to Buy"],
              ["externality", "Hidden Costs"],
            ] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                  tab === t ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ═══════ WHY THIS SCORE ═══════ */}
          {tab === "overview" && scoring && (
            <div className="space-y-3">
              {/* TL;DR summary */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Quick Summary</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {product.product_name} scores <strong className={scoreColor(scoring.final_score)}>{scoring.final_score}/100</strong> ({scoring.label}).
                  {" "}
                  {scoring.final_score >= 70
                    ? "This is a solid choice for sustainability."
                    : scoring.final_score >= 40
                    ? "There are some areas where this product could be more sustainable."
                    : "This product has significant sustainability concerns."
                  }
                  {scoring.base_score !== scoring.final_score && (
                    <span className="text-zinc-500"> Your local area adjusted the score from {scoring.base_score} to {scoring.final_score}.</span>
                  )}
                </p>
              </div>

              {/* Factor bars — always show explanation inline */}
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="px-4 pt-4 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">6 Factors</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {FACTORS.map(({ key, label, icon, tiers }) => {
                    const v = scoring.factors[key];
                    const expanded = expandedFactor === key;
                    return (
                      <button key={key} onClick={() => setExpandedFactor(expanded ? null : key)}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-5 text-center">{icon}</span>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-20">{label}</span>
                          <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barBg(v)}`} style={{ width: `${v}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-7 text-right ${v >= 70 ? "text-green-600" : v >= 40 ? "text-yellow-600" : "text-red-600"}`}>{v}</span>
                        </div>
                        {expanded && (
                          <p className="mt-1.5 ml-7 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {tierText(v, tiers)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local adjustments */}
              {scoring.adjustments.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Your Area</h4>
                  <div className="space-y-1.5">
                    {scoring.adjustments.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 text-xs mt-0.5">{a.penalty_points > 0 ? "\u25BC" : "\u25B2"}</span>
                        <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">{a.reason}</p>
                        <span className={`text-xs font-bold ${a.penalty_points > 0 ? "text-red-600" : "text-green-600"}`}>
                          {a.penalty_points > 0 ? "-" : "+"}{Math.abs(a.penalty_points)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ WHERE TO BUY ═══════ */}
          {tab === "pricing" && pricing && (
            <div className="space-y-3">
              {/* Gas + context bar */}
              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-sm">{"\u26FD"}</span>
                  <span className="text-xs text-zinc-500">Gas ({pricing.user_province ?? "ON"})</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    ${pricing.gas_price_per_litre?.toFixed(2) ?? "?"}/L
                  </span>
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500">Stores</span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{pricing.prices.length}</span>
                </div>
              </div>

              {/* Store list */}
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-700 dark:bg-zinc-900">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {pricing.prices.map((p, i) => (
                    <div key={i}>
                      <StoreRow p={p} isLowest={i === 0} />
                      {/* Map toggle per store */}
                      {userCoords && mapsKey && p.distance_km !== null && (
                        <div className="px-4 pb-2">
                          <button
                            onClick={() => setMapStore(mapStore?.store_name === p.store_name ? null : p)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium"
                          >
                            {mapStore?.store_name === p.store_name ? "\u25B2 Hide route" : "\u25BC Show route"}
                          </button>
                        </div>
                      )}
                      {/* Inline map for selected store */}
                      {mapStore?.store_name === p.store_name && userCoords && mapsKey && (
                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                          <iframe
                            className="w-full h-52 border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${userCoords.lat},${userCoords.lng}&destination=${encodeURIComponent(p.store_name + " near " + (pricing.user_province === "ON" ? "Toronto" : pricing.user_province === "BC" ? "Vancouver" : pricing.user_province === "AB" ? "Calgary" : "Canada"))}&mode=driving&zoom=12`}
                            allowFullScreen
                          />
                          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500">
                              {p.distance_km?.toFixed(1)} km &middot; Round trip gas: <strong className="text-zinc-700 dark:text-zinc-300">${p.gas_cost.toFixed(2)}</strong>
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              Out-of-pocket: <strong className="text-zinc-700 dark:text-zinc-300">${p.out_of_pocket.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost comparison insight */}
              {best && externality && (
                <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-red-50 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-red-950">
                  <p className="text-xs text-zinc-500 mb-1">Total out-of-pocket vs true cost</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">${best.out_of_pocket.toFixed(2)}</span>
                    <span className="text-zinc-400">{"\u2192"}</span>
                    <span className="text-lg font-black text-red-600">${externality.total_cost.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    You pay ${best.out_of_pocket.toFixed(2)} (shelf + gas). Society absorbs an additional ${externality.externality_cost.toFixed(2)} in environmental costs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════ HIDDEN COSTS ═══════ */}
          {tab === "externality" && externality && (
            <div className="space-y-3">
              <ExternalityBreakdown
                externality={externality}
                shelfPrice={best?.price}
                gasCost={best?.gas_cost}
              />
            </div>
          )}
        </>
      )}

      <button onClick={onScanAnother}
        className="w-full rounded-full border border-zinc-300 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
        Scan another product
      </button>
    </div>
  );
}
