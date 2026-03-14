"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import CameraCapture from "@/components/scan/CameraCapture";
import Disambiguation from "@/components/scan/Disambiguation";
import ProductResult from "@/components/scan/ProductResult";

type ScanState = "idle" | "scanning" | "identified" | "disambiguating";

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [product, setProduct] = useState<Product | null>(null);
  const [candidates, setCandidates] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture(file: File) {
    setState("scanning");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      if (data.needs_disambiguation && data.candidates) {
        setCandidates(data.candidates);
        setProduct(data.product);
        setState("disambiguating");
      } else {
        setProduct(data.product);
        setState("identified");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
  }

  function handleDisambiguationSelect(selected: Product) {
    setProduct(selected);
    setCandidates([]);
    setState("identified");
  }

  function handleScanAnother() {
    setProduct(null);
    setCandidates([]);
    setError(null);
    setState("idle");
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Scan a Product
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Take a photo or upload an image to identify a product
        </p>
      </header>

      <main className="flex w-full flex-col items-center gap-6">
        {error && (
          <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {(state === "idle" || state === "scanning") && (
          <CameraCapture
            onCapture={handleCapture}
            isScanning={state === "scanning"}
          />
        )}

        {state === "disambiguating" && candidates.length > 0 && (
          <Disambiguation
            candidates={candidates}
            onSelect={handleDisambiguationSelect}
          />
        )}

        {state === "identified" && product && (
          <ProductResult
            product={product}
            onScanAnother={handleScanAnother}
          />
        )}
      </main>
    </div>
  );
}
