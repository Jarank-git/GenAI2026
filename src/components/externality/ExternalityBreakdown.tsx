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

  const carbonPrice = new Date().getFullYear() >= 2030 ? 170 : new Date().getFullYear() <= 2024 ? 95 :
    ({ 2025: 95, 2026: 110, 2027: 125, 2028: 140, 2029: 155 } as Record<number, number>)[new Date().getFullYear()] ?? 110;

  const lineItems: LineItemProps[] = [
    {
      label: "Carbon Emissions",
      icon: "\u{1F32B}\uFE0F",
      cost: breakdown.carbon.cost,
      detail: `${breakdown.carbon.kg_co2e} kg CO\u2082e full lifecycle`,
      methodology:
        `Calculated using Canada\u2019s federal carbon pricing schedule at $${carbonPrice}/tonne CO\u2082e (${new Date().getFullYear()}). ` +
        `Formula: ${breakdown.carbon.kg_co2e} kg \u00D7 $${(carbonPrice / 1000).toFixed(4)}/kg = $${breakdown.carbon.cost.toFixed(2)}. ` +
        "Lifecycle emissions (production, transport, retail, disposal) are estimated by Google Gemini 2.5 Flash using grounded search data. " +
        "Reference: Government of Canada Greenhouse Gas Pollution Pricing Act carbon price schedule.",
    },
    {
      label: "Water Usage",
      icon: "\u{1F4A7}",
      cost: breakdown.water.cost,
      detail: `${breakdown.water.litres}L \u00D7 ${breakdown.water.scarcity_multiplier}x local scarcity`,
      methodology:
        `Formula: ${breakdown.water.litres}L \u00D7 $0.0001/L base cost \u00D7 ${breakdown.water.scarcity_multiplier}x scarcity multiplier = $${breakdown.water.cost.toFixed(2)}. ` +
        `Scarcity multipliers reflect your local watershed stress level: low (1.0x), medium (1.5x), high (2.5x), or very high (4.0x). ` +
        "Production water consumption is estimated by Google Gemini 2.5 Flash. Watershed stress data comes from provincial water resource assessments.",
    },
    {
      label: "Packaging Waste",
      icon: "\u{1F4E6}",
      cost: breakdown.packaging.cost,
      detail: breakdown.packaging.materials
        .map(
          (m) =>
            `${m.grams}g ${m.material}${m.recyclable_locally ? " \u2713" : " (landfill)"}`,
        )
        .join(", "),
      methodology:
        "Each packaging material is costed per gram based on its environmental impact (e.g., PET plastic at $0.0008/g, cardboard at $0.0002/g, glass at $0.0003/g). " +
        "Materials that are not accepted by your local municipal recycling program incur a 2.5\u00D7 landfill multiplier to reflect disposal externalities. " +
        "Recyclability is checked against your municipality\u2019s blue-box accepted materials list.",
    },
    {
      label: "Land Use Change",
      icon: "\u{1F333}",
      cost: breakdown.land_use.cost,
      detail: `${breakdown.land_use.m2} m\u00B2 of land attributable`,
      methodology:
        `Formula: ${breakdown.land_use.m2} m\u00B2 \u00D7 commodity-specific cost/m\u00B2 = $${breakdown.land_use.cost.toFixed(2)}. ` +
        "Commodity rates vary: beef ($0.015/m\u00B2), palm oil ($0.020/m\u00B2), soy ($0.010/m\u00B2), coffee ($0.012/m\u00B2), cocoa ($0.014/m\u00B2). " +
        "These rates reflect the environmental cost of habitat conversion and deforestation driven by agricultural commodity supply chains.",
    },
    {
      label: "Eutrophication",
      icon: "\u{1F30A}",
      cost: breakdown.eutrophication.cost,
      detail: `Runoff index: ${breakdown.eutrophication.index}/10`,
      methodology:
        `Formula: index ${breakdown.eutrophication.index} \u00D7 $0.02 = $${breakdown.eutrophication.cost.toFixed(2)}. ` +
        "The eutrophication index (0\u201310) measures fertilizer and chemical runoff that causes algal blooms, oxygen depletion, and aquatic ecosystem damage. " +
        "Estimated by Google Gemini 2.5 Flash based on the product\u2019s agricultural inputs and manufacturing processes.",
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
          {" "}through healthcare, environmental remediation, and ecosystem damage
        </p>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border)]">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Data Sources & References</p>
        <div className="space-y-1 text-[11px] text-[var(--muted)] leading-relaxed">
          <p>&bull; <strong>Carbon Price:</strong> Government of Canada &mdash; Greenhouse Gas Pollution Pricing Act, federal carbon price schedule ($110/tonne in 2026, rising to $170 by 2030)</p>
          <p>&bull; <strong>Lifecycle Estimates:</strong> Google Gemini 2.5 Flash API with grounded search &mdash; estimates CO&#8322;, water, and land use per product unit</p>
          <p>&bull; <strong>Water Scarcity:</strong> Provincial watershed stress assessments &mdash; multipliers from 1.0x (low stress) to 4.0x (very high stress)</p>
          <p>&bull; <strong>Packaging Costs:</strong> Material-specific environmental cost rates &mdash; landfill penalty (2.5x) based on your municipal recycling program</p>
          <p>&bull; <strong>Land Use:</strong> Commodity-specific deforestation and habitat conversion cost rates based on global supply chain impact assessments</p>
          <p>&bull; <strong>Recyclability:</strong> Municipal blue-box accepted materials lists for your postal code area</p>
        </div>
      </div>
    </div>
  );
}
