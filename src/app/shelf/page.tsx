"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  AnalyzedShelfProduct,
  ShelfOverlayMode,
  ShelfScanResult,
} from "@/types/shelf";
import ShelfScanner from "@/components/shelf/ShelfScanner";
import ShelfOverlay from "@/components/shelf/ShelfOverlay";
import ShelfProductDetail from "@/components/shelf/ShelfProductDetail";
import ShelfSortToggle from "@/components/shelf/ShelfSortToggle";
import { loadProfile } from "@/lib/profile-storage";

type ScanPhase =
  | "idle"
  | "capturing"
  | "processing"
  | "complete"
  | "error";

export default function ShelfPage() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [overlayMode, setOverlayMode] = useState<ShelfOverlayMode>("score");
  const [selectedProduct, setSelectedProduct] = useState<AnalyzedShelfProduct | null>(null);
  const [products, setProducts] = useState<AnalyzedShelfProduct[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCapture = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageUrl(dataUrl);
      setPhase("processing");
      setErrorMessage("");

      try {
        const profile = loadProfile();
        const formData = new FormData();
        formData.append("image", file);
        if (profile) {
          formData.append("userProfile", JSON.stringify(profile));
        }

        const res = await fetch("/api/shelf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error || `API error: ${res.status}`);
        }

        const result: ShelfScanResult = await res.json();
        setProducts(result.products);
        setPhase("complete");
      } catch (err) {
        console.error("Shelf scan failed:", err);
        setErrorMessage(err instanceof Error ? err.message : "Shelf scan failed");
        setPhase("error");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setImageUrl("");
    setProducts([]);
    setSelectedProduct(null);
    setErrorMessage("");
  }, []);

  const bestProduct = products.find((p) => p.is_best_on_shelf);

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
          <h1 className="text-editorial text-lg text-foreground">Shelf Scanner</h1>
        </div>
      </header>

      <main className="page-content flex flex-col items-center gap-5">
        {phase === "idle" && (
          <div className="animate-fade-up w-full">
            <div className="mb-5 text-center">
              <p className="section-label mb-3">Shelf Analysis</p>
              <h2 className="text-editorial text-2xl text-foreground">
                Scan an <em className="text-accent">Entire Shelf</em>
              </h2>
              <p className="mt-2 text-sm font-light text-muted">
                Compare products side-by-side with sustainability overlays
              </p>
            </div>
            <ShelfScanner onCapture={handleCapture} isLoading={false} />
          </div>
        )}

        {phase === "processing" && (
          <div className="flex w-full flex-col items-center gap-4">
            {imageUrl && (
              <div className="relative w-full overflow-hidden rounded-xl border border-border">
                <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
                  <Image
                    src={imageUrl}
                    alt="Shelf being scanned"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                    fill
                    unoptimized
                  />
                </div>
              </div>
            )}
            <div className="eco-card flex w-full flex-col items-center gap-3 p-6">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="text-sm font-light text-muted">
                Detecting, identifying, and analyzing products...
              </p>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="eco-card flex w-full flex-col items-center gap-3 p-6 text-center">
              <p className="text-sm font-semibold text-red-600">Scan Failed</p>
              <p className="text-xs text-muted">{errorMessage}</p>
              <button onClick={handleReset} className="btn-secondary mt-2">
                Try Again
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="animate-fade-up flex w-full flex-col items-center gap-4">
            {bestProduct && (
              <div className="flex w-full items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
                  {bestProduct.sustainability?.final_score ?? "?"}
                </div>
                <div className="flex-1">
                  <p className="section-label text-accent">Best on Shelf</p>
                  <p className="text-sm font-medium text-foreground">
                    {bestProduct.product.product_name}
                  </p>
                </div>
              </div>
            )}

            <ShelfOverlay
              imageUrl={imageUrl}
              products={products}
              mode={overlayMode}
              onProductTap={setSelectedProduct}
            />

            <ShelfSortToggle mode={overlayMode} onModeChange={setOverlayMode} />

            <p className="text-xs font-light text-muted">
              {products.length} products analyzed &middot; Tap any product for details
            </p>

            <button onClick={handleReset} className="btn-secondary w-full">
              Scan Another Shelf
            </button>
          </div>
        )}

        {selectedProduct && (
          <ShelfProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </main>
    </div>
  );
}
