"use client";

import Link from "next/link";
import ComparisonView from "@/components/comparison/ComparisonView";
import ExternalityBreakdown from "@/components/externality/ExternalityBreakdown";
import { mockScannedProduct, mockAlternatives } from "@/data/mock-alternatives";
import type { Externality } from "@/types/externality";

const mockExternality: Externality = {
  product_id: mockScannedProduct.product_id,
  externality_cost: mockScannedProduct.externality_cost,
  breakdown: {
    carbon: { cost: 0.35, kg_co2e: 1.8 },
    water: { cost: 0.22, litres: 1200, scarcity_multiplier: 1.2 },
    packaging: {
      cost: 0.18,
      materials: [
        { material: "cardboard", grams: 45, cost: 0.05, recyclable_locally: true },
        { material: "plastic film", grams: 12, cost: 0.13, recyclable_locally: false },
      ],
    },
    land_use: { cost: 0.25, m2: 3.2 },
    eutrophication: { cost: 0.12, index: 4 },
  },
  total_cost: mockScannedProduct.total_cost,
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-base font-semibold text-gray-900">
            Demo: Pasta Alternatives
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 flex flex-col gap-8">
        <ComparisonView
          scannedProduct={mockScannedProduct}
          alternatives={mockAlternatives}
        />

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Hidden Cost Breakdown
          </h2>
          <ExternalityBreakdown
            externality={mockExternality}
            shelfPrice={mockScannedProduct.shelf_price}
            gasCost={mockScannedProduct.gas_cost}
          />
        </section>
      </main>
    </div>
  );
}
