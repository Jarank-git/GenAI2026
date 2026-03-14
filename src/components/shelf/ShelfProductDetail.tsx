"use client";

import type { AnalyzedShelfProduct } from "@/types/shelf";
import Link from "next/link";

interface ShelfProductDetailProps {
  product: AnalyzedShelfProduct;
  onClose: () => void;
}

function scoreColorClass(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-lime-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
}

function scoreBgClass(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-lime-100";
  if (score >= 40) return "bg-orange-100";
  return "bg-red-100";
}

function FactorBar({ label, value }: { label: string; value: number }) {
  const barColor =
    value >= 70
      ? "bg-green-500"
      : value >= 50
        ? "bg-lime-500"
        : value >= 30
          ? "bg-orange-400"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-xs text-gray-500 capitalize">
        {label.replace("_", " ")}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium text-gray-700">
        {value}
      </span>
    </div>
  );
}

export default function ShelfProductDetail({
  product,
  onClose,
}: ShelfProductDetailProps) {
  const score = product.sustainability?.final_score ?? 0;
  const factors = product.sustainability?.factors;
  const ext = product.externality;
  const price = product.price;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="h-1 w-10 rounded-full bg-gray-300 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="Close"
          >
            {"\u2715"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {product.product.product_name}
              </h2>
              <p className="text-sm text-gray-500">
                {product.product.brand} &middot; {product.product.weight_volume}
              </p>
            </div>
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${scoreBgClass(score)}`}
            >
              <span
                className={`text-2xl font-bold ${scoreColorClass(score)}`}
              >
                {score}
              </span>
            </div>
          </div>

          <p className="mt-1 text-xs font-medium text-gray-400">
            {product.sustainability?.label ?? "Unknown"} sustainability
          </p>

          {factors && (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Factor Breakdown
              </h3>
              <FactorBar label="transport" value={factors.transport} />
              <FactorBar label="packaging" value={factors.packaging} />
              <FactorBar label="certifications" value={factors.certifications} />
              <FactorBar label="brand_ethics" value={factors.brand_ethics} />
              <FactorBar label="production" value={factors.production} />
              <FactorBar label="end_of_life" value={factors.end_of_life} />
            </div>
          )}

          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Cost Breakdown
            </h3>
            <div className="mt-2 space-y-1.5">
              {price && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shelf Price</span>
                    <span className="font-medium text-gray-900">
                      ${price.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gas Cost</span>
                    <span className="font-medium text-gray-900">
                      ${price.gas_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Out-of-Pocket</span>
                    <span className="font-medium text-gray-900">
                      ${price.out_of_pocket.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {ext && (
                <>
                  <div className="my-1 border-t border-gray-200" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Externality Cost</span>
                    <span className="font-medium text-orange-600">
                      +${ext.externality_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">Total True Cost</span>
                    <span className="text-gray-900">
                      ${ext.total_cost.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {ext && (
            <div className="mt-4 rounded-xl bg-orange-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Externality Details
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    Carbon ({ext.breakdown.carbon.kg_co2e} kg CO2e)
                  </span>
                  <span>${ext.breakdown.carbon.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    Water ({ext.breakdown.water.litres}L)
                  </span>
                  <span>${ext.breakdown.water.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Packaging</span>
                  <span>${ext.breakdown.packaging.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Land Use</span>
                  <span>${ext.breakdown.land_use.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Eutrophication</span>
                  <span>${ext.breakdown.eutrophication.cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/demo"
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            View Alternatives
          </Link>
        </div>
      </div>
    </>
  );
}
