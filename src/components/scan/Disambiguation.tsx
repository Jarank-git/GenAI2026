"use client";

import { useState } from "react";
import type { Product } from "@/types/product";

interface DisambiguationProps {
  candidates: Product[];
  onSelect: (product: Product) => void;
}

const categoryLabels: Record<string, string> = {
  food_beverage: "Food & Beverage",
  cleaning: "Cleaning",
  personal_care: "Personal Care",
  clothing: "Clothing",
  electronics: "Electronics",
  home_goods: "Home Goods",
};

export default function Disambiguation({
  candidates,
  onSelect,
}: DisambiguationProps) {
  const [manualSearch, setManualSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchText.trim()) return;

    const manualProduct: Product = {
      product_id: `manual-${Date.now()}`,
      product_name: searchText.trim(),
      brand: "Unknown",
      category: "food_beverage",
      weight_volume: "",
      barcode: null,
      image_url: null,
      confidence: 1.0,
      open_food_facts_match: false,
    };
    onSelect(manualProduct);
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Which product is this?
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        We found multiple possible matches. Please select the correct one.
      </p>

      <div className="flex flex-col gap-2">
        {candidates.map((product) => (
          <button
            key={product.product_id}
            onClick={() => onSelect(product)}
            className="flex flex-col rounded-xl border border-zinc-200 p-4 text-left transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-950"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {product.product_name}
            </span>
            <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {product.brand} &middot; {categoryLabels[product.category]} &middot;{" "}
              {product.weight_volume}
            </span>
          </button>
        ))}
      </div>

      {!manualSearch ? (
        <button
          onClick={() => setManualSearch(true)}
          className="mt-4 w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          None of these &mdash; search manually
        </button>
      ) : (
        <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            placeholder="Enter product name..."
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
