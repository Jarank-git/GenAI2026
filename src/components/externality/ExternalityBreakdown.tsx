"use client";

import { useState } from "react";
import type { Externality } from "@/types/externality";

interface ExternalityBreakdownProps {
  externality: Externality;
  shelfPrice?: number;
  gasCost?: number;
}

interface LineItemProps {
  label: string;
  icon: string;
  cost: number;
  detail: string;
  methodology: string;
}

function LineItem({ label, icon, cost, detail, methodology }: LineItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[var(--earth-light)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--eco-red)]">
            +${cost.toFixed(2)}
          </span>
          <svg className={`h-3.5 w-3.5 text-[var(--muted)] transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-4 pl-14">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {methodology}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ExternalityBreakdown({
  externality,
  shelfPrice,
  gasCost,
}: ExternalityBreakdownProps) {
  const { breakdown } = externality;
  const displayShelfPrice = shelfPrice ?? 0;
  const displayGasCost = gasCost ?? 0;

  const lineItems: LineItemProps[] = [
    {
      label: "Carbon Emissions",
      icon: "\u{1F32B}\uFE0F",
      cost: breakdown.carbon.cost,
      detail: `${breakdown.carbon.kg_co2e} kg CO\u2082e`,
      methodology:
        "Based on Canada\u2019s federal carbon price schedule. Covers full lifecycle emissions from production through transport.",
    },
    {
      label: "Water Usage",
      icon: "\u{1F4A7}",
      cost: breakdown.water.cost,
      detail: `${breakdown.water.litres}L (${breakdown.water.scarcity_multiplier}x scarcity)`,
      methodology:
        "Water cost reflects local watershed stress levels. Higher scarcity multipliers apply in water-stressed regions.",
    },
    {
      label: "Packaging Waste",
      icon: "\u{1F4E6}",
      cost: breakdown.packaging.cost,
      detail: breakdown.packaging.materials
        .map(
          (m) =>
            `${m.grams}g ${m.material}${m.recyclable_locally ? "" : " (not recyclable here)"}`,
        )
        .join(", "),
      methodology:
        "Packaging cost per gram by material type. Non-locally-recyclable materials incur a 2.5x landfill multiplier.",
    },
    {
      label: "Land Use Change",
      icon: "\u{1F333}",
      cost: breakdown.land_use.cost,
      detail: `${breakdown.land_use.m2} m\u00B2`,
      methodology:
        "Reflects the cost of land-use change attributable to this product\u2019s supply chain, weighted by commodity impact.",
    },
    {
      label: "Eutrophication",
      icon: "\u{1F30A}",
      cost: breakdown.eutrophication.cost,
      detail: `Index: ${breakdown.eutrophication.index}/10`,
      methodology:
        "Measures fertilizer and chemical runoff impact on waterways. Higher index means more nutrient pollution.",
    },
  ];

  return (
    <div className="eco-card overflow-hidden">
      {shelfPrice !== undefined && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--earth-light)] border-b border-[var(--border)]">
          <span className="text-sm text-[var(--muted)]">Shelf Price</span>
          <span className="text-sm font-bold text-[var(--foreground)]">
            ${displayShelfPrice.toFixed(2)}
          </span>
        </div>
      )}

      {gasCost !== undefined && gasCost > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--earth-light)] border-b border-[var(--border)]">
          <span className="text-sm text-[var(--muted)]">Gas Cost to Store</span>
          <span className="text-sm font-bold text-[var(--foreground)]">
            +${displayGasCost.toFixed(2)}
          </span>
        </div>
      )}

      <div className="px-5 py-3 border-b border-[var(--border)]">
        <p className="section-label text-[var(--eco-red)]">
          Hidden Environmental Costs
        </p>
      </div>

      <div>
        {lineItems.map((item) => (
          <LineItem key={item.label} {...item} />
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-5 bg-[var(--eco-red)]/8 border-t border-[var(--eco-red)]/15">
        <span className="text-sm font-bold text-[var(--foreground)] tracking-wide uppercase">True Cost</span>
        <span className="text-xl font-black text-[var(--eco-red)]">
          ${externality.total_cost.toFixed(2)}
        </span>
      </div>

      <div className="px-5 py-3.5 bg-[var(--earth-light)] border-t border-[var(--border)]">
        <p className="text-xs text-center text-[var(--muted)]">
          Society pays the other{" "}
          <span className="font-bold text-[var(--eco-red)]">
            ${externality.externality_cost.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
