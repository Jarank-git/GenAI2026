"use client";

import type { AlternativeProduct } from "@/types/alternatives";

interface ScannedProductCardProps {
  product: AlternativeProduct;
}

export default function ScannedProductCard({ product }: ScannedProductCardProps) {
  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
        Your Product
      </p>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-gray-900">{product.product_name}</p>
          <p className="text-sm text-gray-500">{product.brand} &middot; {product.store_name}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-2.5 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Score</p>
          <p className="text-lg font-bold text-gray-900">{product.sustainability_score}</p>
        </div>
        <div className="rounded-lg bg-white p-2.5 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Out-of-Pocket</p>
          <p className="text-lg font-bold text-gray-900">${product.out_of_pocket.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-white p-2.5 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Externality</p>
          <p className="text-lg font-bold text-red-600">${product.externality_cost.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-white p-2.5 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">True Cost</p>
          <p className="text-lg font-bold text-gray-900">${product.total_cost.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
