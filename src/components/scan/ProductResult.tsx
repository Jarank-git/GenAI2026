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

const FACTORS: {
  key: keyof import("@/types/scoring").FactorScores;
  label: string;
  icon: string;
  tiers: [string, string, string];
}[] = [
  { key: "transport", label: "Transport", icon: "\u{1F69B}", tiers: ["Produced nearby \u2014 low shipping emissions", "Moderate distance \u2014 some shipping emissions", "Shipped very far \u2014 high carbon from transport"] },
  { key: "packaging", label: "Packaging", icon: "\u{1F4E6}", tiers: ["Minimal or recyclable packaging", "Some non-recyclable materials", "Heavy or non-recyclable packaging"] },
  { key: "certifications", label: "Certifications", icon: "\u2705", tiers: ["Certified organic, Fair Trade, or equivalent", "Some certifications present", "No sustainability certifications found"] },
  { key: "brand_ethics", label: "Brand Ethics", icon: "\u{1F91D}", tiers: ["Strong transparency & ethical practices", "Mixed record on ethics & supply chain", "Concerns about labor or environment"] },
  { key: "production", label: "Production", icon: "\u{1F3ED}", tiers: ["Efficient, low-impact manufacturing", "Standard industrial production", "Energy-intensive or wasteful processes"] },
  { key: "end_of_life", label: "Recyclability", icon: "\u267B\uFE0F", tiers: ["Fully recyclable or compostable", "Partially recyclable", "Mostly ends up in landfill"] },
];

function scoreTheme(s: number) {
  if (s >= 80) return { color: "var(--eco-green)", bg: "var(--accent-light)", text: "var(--eco-green)" };
  if (s >= 60) return { color: "var(--eco-green)", bg: "var(--accent-light)", text: "var(--eco-green)" };
  if (s >= 40) return { color: "var(--eco-yellow)", bg: "#FEF9E7", text: "var(--eco-yellow)" };
  if (s >= 20) return { color: "var(--eco-orange)", bg: "#FDF0E6", text: "var(--eco-orange)" };
  return { color: "var(--eco-red)", bg: "#FDECEB", text: "var(--eco-red)" };
}

function barColor(v: number) {
  if (v >= 70) return "var(--eco-green)";
  if (v >= 40) return "var(--eco-yellow)";
  return "var(--eco-red)";
}

function ExternalLinkIcon() {
  return (
    <svg className="inline h-3.5 w-3.5 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5L10.5 13.5" />
    </svg>
  );
}

function StoreRow({ p, isLowest }: { p: PriceResult; isLowest: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${isLowest ? "bg-[var(--accent-light)]/40" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isLowest && (
            <span className="section-label !text-[9px] text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full">Best</span>
          )}
          {p.source_url ? (
            <a href={p.source_url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-[var(--accent)] underline decoration-[var(--accent-light)] underline-offset-2 hover:text-[var(--accent-hover)] hover:decoration-[var(--accent)] transition-colors">
              {p.store_name}<ExternalLinkIcon />
            </a>
          ) : (
            <span className="text-sm font-semibold text-[var(--foreground)]">{p.store_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          {p.distance_km !== null && (
            <span className="text-xs text-[var(--muted)]">{p.distance_km.toFixed(1)} km</span>
          )}
          {p.gas_cost > 0 && (
            <span className="text-xs text-[var(--muted)]">+${p.gas_cost.toFixed(2)} gas</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            p.confidence === "verified"
              ? "bg-[var(--accent-light)] text-[var(--accent)]"
              : "bg-[var(--eco-yellow)]/15 text-[var(--eco-yellow)]"
          }`}>
            {p.confidence === "verified" ? "\u2713 Verified" : "~ Estimate"}
          </span>
        </div>
      </div>
      <div className="text-right pl-4">
        <p className="text-lg font-black text-[var(--foreground)]">${p.price.toFixed(2)}</p>
        <p className="text-xs text-[var(--muted)]">${p.out_of_pocket.toFixed(2)} total</p>
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
        setPricing(d); setPState("loaded"); setMapStore(d.prices?.[0] ?? null);
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
  const theme = scoring ? scoreTheme(scoring.final_score) : null;

  return (
    <div className="w-full max-w-lg space-y-5">
      {/* ─── Product Header Card ─── */}
      <div className="eco-card p-6 animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-editorial text-xl text-[var(--foreground)]">{product.product_name}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">{product.brand} · {categoryLabels[product.category]} · {product.weight_volume}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            product.confidence >= 0.9 ? "bg-[var(--accent-light)] text-[var(--accent)]" :
            product.confidence >= 0.7 ? "bg-[var(--eco-yellow)]/15 text-[var(--eco-yellow)]" :
            "bg-[var(--eco-red)]/10 text-[var(--eco-red)]"
          }`}>
            {product.confidence >= 0.9 ? "High" : product.confidence >= 0.7 ? "Medium" : "Low"} confidence
          </span>
        </div>

        {sState === "loaded" && scoring && theme ? (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3.5 text-center" style={{ backgroundColor: theme.bg }}>
              <p className="section-label !text-[9px]">Score</p>
              <p className="text-3xl font-black mt-1" style={{ color: theme.color }}>{scoring.final_score}</p>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold mt-1" style={{ backgroundColor: `${theme.color}20`, color: theme.text }}>{scoring.label}</span>
            </div>
            <div className="rounded-xl bg-[var(--card)] p-3.5 text-center">
              <p className="section-label !text-[9px]">Cheapest</p>
              <p className="text-3xl font-black text-[var(--foreground)] mt-1">{best ? `$${best.price.toFixed(2)}` : "\u2014"}</p>
              {best && <p className="text-[10px] text-[var(--muted)] mt-1 truncate">{best.store_name}</p>}
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ backgroundColor: "#FDECEB" }}>
              <p className="section-label !text-[9px]">True Cost</p>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--eco-red)" }}>{externality ? `$${externality.total_cost.toFixed(2)}` : "\u2014"}</p>
              {externality && <p className="text-[10px] mt-1" style={{ color: "var(--eco-red)" }}>+${externality.externality_cost.toFixed(2)} hidden</p>}
            </div>
          </div>
        ) : sState === "loading" ? (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-[var(--card)] p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            <p className="text-sm text-[var(--muted)]">Analyzing sustainability, pricing & true cost...</p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[var(--eco-red)]/8 p-5 text-center text-sm" style={{ color: "var(--eco-red)" }}>
            Analysis could not be completed. Try again later.
          </div>
        )}
      </div>

      {/* ─── Tabs ─── */}
      {!loading && (sState === "loaded" || pState === "loaded") && (
        <>
          <div className="flex rounded-xl bg-[var(--card)] p-1.5 border border-[var(--border)]">
            {([
              ["overview", "Why This Score"],
              ["pricing", "Where to Buy"],
              ["externality", "Hidden Costs"],
            ] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  tab === t
                    ? "bg-white text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ═══ WHY THIS SCORE ═══ */}
          {tab === "overview" && scoring && (
            <div className="space-y-4 animate-fade-up">
              <div className="eco-card p-5">
                <h3 className="section-label mb-3">Quick Summary</h3>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {product.product_name} scores{" "}
                  <strong style={{ color: theme?.color }}>{scoring.final_score}/100</strong> ({scoring.label}).
                  {" "}
                  {scoring.final_score >= 70
                    ? "This is a solid choice for sustainability."
                    : scoring.final_score >= 40
                    ? "There are some areas where this product could improve."
                    : "This product has significant sustainability concerns."}
                  {scoring.base_score !== scoring.final_score && (
                    <span className="text-[var(--muted)]"> Your local area adjusted the score from {scoring.base_score} to {scoring.final_score}.</span>
                  )}
                </p>
              </div>

              <div className="eco-card overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="section-label">6 Sustainability Factors</h3>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {FACTORS.map(({ key, label, icon, tiers }) => {
                    const v = scoring.factors[key];
                    const expanded = expandedFactor === key;
                    return (
                      <button key={key} onClick={() => setExpandedFactor(expanded ? null : key)}
                        className="w-full text-left px-5 py-3.5 hover:bg-[var(--earth-light)] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg w-6 text-center">{icon}</span>
                          <span className="text-sm font-medium text-[var(--foreground)] w-24">{label}</span>
                          <div className="flex-1 h-2.5 rounded-full bg-[var(--card)] overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, backgroundColor: barColor(v) }} />
                          </div>
                          <span className="text-sm font-black w-8 text-right" style={{ color: barColor(v) }}>{v}</span>
                          <svg className={`h-3.5 w-3.5 text-[var(--muted)] transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                        {expanded && (
                          <p className="mt-2 ml-9 text-xs text-[var(--muted)] leading-relaxed">
                            {v >= 70 ? tiers[0] : v >= 40 ? tiers[1] : tiers[2]}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {scoring.adjustments.length > 0 && (
                <div className="eco-card p-5" style={{ borderColor: "var(--eco-yellow)", backgroundColor: "#FEF9E7" }}>
                  <h4 className="section-label mb-3" style={{ color: "var(--eco-orange)" }}>Location-Based Adjustments</h4>
                  <div className="space-y-2.5">
                    {scoring.adjustments.map((a, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-sm mt-0.5" style={{ color: a.penalty_points > 0 ? "var(--eco-red)" : "var(--eco-green)" }}>
                          {a.penalty_points > 0 ? "\u25BC" : "\u25B2"}
                        </span>
                        <p className="text-sm flex-1" style={{ color: "var(--earth)" }}>{a.reason}</p>
                        <span className="text-sm font-bold whitespace-nowrap" style={{ color: a.penalty_points > 0 ? "var(--eco-red)" : "var(--eco-green)" }}>
                          {a.penalty_points > 0 ? "-" : "+"}{Math.abs(a.penalty_points)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ WHERE TO BUY ═══ */}
          {tab === "pricing" && pricing && (
            <div className="space-y-4 animate-fade-up">
              {/* Gas + store count */}
              <div className="eco-card flex items-center gap-4 px-5 py-3.5">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{"\u26FD"}</span>
                  <span className="text-sm text-[var(--muted)]">Gas ({pricing.user_province ?? "ON"})</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">
                    ${pricing.gas_price_per_litre?.toFixed(2) ?? "?"}/L
                  </span>
                </div>
                <div className="h-5 w-px bg-[var(--border)]" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">Stores found</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{pricing.prices.length}</span>
                </div>
              </div>

              {/* Store list */}
              <div className="eco-card overflow-hidden">
                <div className="divide-y divide-[var(--border)]">
                  {pricing.prices.map((p, i) => (
                    <div key={i}>
                      <StoreRow p={p} isLowest={i === 0} />
                      {userCoords && mapsKey && p.distance_km !== null && (
                        <div className="px-5 pb-3">
                          <button
                            onClick={() => setMapStore(mapStore?.store_name === p.store_name ? null : p)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            style={{ color: "var(--accent)" }}
                          >
                            <svg className={`h-3.5 w-3.5 transition-transform ${mapStore?.store_name === p.store_name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            {mapStore?.store_name === p.store_name ? "Hide route" : "Show driving route"}
                          </button>
                        </div>
                      )}
                      {mapStore?.store_name === p.store_name && userCoords && mapsKey && (
                        <div className="border-t border-[var(--border)]">
                          <iframe
                            className="w-full border-0"
                            style={{ height: "280px" }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${userCoords.lat},${userCoords.lng}&destination=${encodeURIComponent(p.store_name + " near " + (pricing.user_province === "ON" ? "Toronto" : pricing.user_province === "BC" ? "Vancouver" : pricing.user_province === "AB" ? "Calgary" : "Canada"))}&mode=driving&zoom=12`}
                            allowFullScreen
                          />
                          <div className="px-5 py-3.5 bg-[var(--earth-light)] flex items-center justify-between border-t border-[var(--border)]">
                            <span className="text-xs text-[var(--muted)]">
                              {p.distance_km?.toFixed(1)} km &middot; Round trip gas: <strong className="text-[var(--foreground)]">${p.gas_cost.toFixed(2)}</strong>
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              Out-of-pocket: <strong className="text-[var(--foreground)]">${p.out_of_pocket.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost insight */}
              {best && externality && (
                <div className="eco-card p-5 bg-gradient-to-r from-[var(--card)] to-[var(--eco-red)]/5">
                  <p className="section-label mb-2">What You Pay vs. What It Really Costs</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-black text-[var(--foreground)]">${best.out_of_pocket.toFixed(2)}</span>
                    <span className="text-[var(--muted)] text-lg">{"\u2192"}</span>
                    <span className="text-2xl font-black" style={{ color: "var(--eco-red)" }}>${externality.total_cost.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
                    You pay ${best.out_of_pocket.toFixed(2)} at the register (shelf price + gas). Society absorbs an additional ${externality.externality_cost.toFixed(2)} in environmental damage.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══ HIDDEN COSTS ═══ */}
          {tab === "externality" && externality && (
            <div className="animate-fade-up">
              <ExternalityBreakdown
                externality={externality}
                shelfPrice={best?.price}
                gasCost={best?.gas_cost}
              />
            </div>
          )}
        </>
      )}

      <button onClick={onScanAnother} className="btn-secondary w-full py-3.5 text-sm">
        Scan another product
      </button>
    </div>
  );
}
