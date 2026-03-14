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
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-red-600">
            +${cost.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">{expanded ? "^" : "v"}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-12">
          <p className="text-xs text-gray-500 leading-relaxed">
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
      detail: `${breakdown.carbon.kg_co2e} kg CO2e`,
      methodology:
        "Based on Canada's federal carbon price schedule. Covers full lifecycle emissions from production through transport.",
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
        "Reflects the cost of land-use change attributable to this product's supply chain, weighted by commodity impact.",
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {shelfPrice !== undefined && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">Shelf Price</span>
          <span className="text-sm font-semibold text-gray-900">
            ${displayShelfPrice.toFixed(2)}
          </span>
        </div>
      )}

      {gasCost !== undefined && gasCost > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">Gas Cost to Store</span>
          <span className="text-sm font-semibold text-gray-900">
            +${displayGasCost.toFixed(2)}
          </span>
        </div>
      )}

      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          Hidden Costs
        </p>
      </div>

      <div>
        {lineItems.map((item) => (
          <LineItem key={item.label} {...item} />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-4 bg-red-50 border-t border-red-100">
        <span className="text-sm font-bold text-gray-900">TRUE COST</span>
        <span className="text-lg font-bold text-red-700">
          ${externality.total_cost.toFixed(2)}
        </span>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500">
          Society pays the other{" "}
          <span className="font-semibold text-red-600">
            ${externality.externality_cost.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
