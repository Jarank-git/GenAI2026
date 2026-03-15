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
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-inner">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-editorial text-lg text-foreground">
            Demo: Pasta Alternatives
          </h1>
        </div>
      </header>

      <main className="page-content flex flex-col gap-8">
        <div className="animate-fade-up text-center">
          <p className="section-label mb-3">Interactive Demo</p>
          <h2 className="text-editorial text-2xl text-foreground">
            Explore <em className="text-accent">Sorting Modes</em>
          </h2>
          <p className="mt-2 text-sm font-light text-muted">
            Compare products across sustainability, price, and true cost
          </p>
        </div>

        <ComparisonView
          scannedProduct={mockScannedProduct}
          alternatives={mockAlternatives}
        />

        <section>
          <p className="section-label mb-3">Hidden Cost Breakdown</p>
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
