"use client";

import { useState } from "react";
import Link from "next/link";
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
          <div>
            <h1 className="text-editorial text-lg text-foreground">Scan a Product</h1>
          </div>
        </div>
      </header>

      <main className="page-content flex flex-col items-center gap-6">
        {state === "idle" && !error && (
          <div className="animate-fade-up w-full text-center">
            <p className="section-label mb-2">Product Identification</p>
            <p className="text-sm font-light text-muted">
              Take a photo or upload an image to reveal the true cost
            </p>
          </div>
        )}

        {error && (
          <div className="animate-scale-in w-full max-w-sm rounded-xl border border-eco-red/20 bg-eco-red/5 p-4 text-center">
            <p className="text-sm font-light text-eco-red">{error}</p>
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
