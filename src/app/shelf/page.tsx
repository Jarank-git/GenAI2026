"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type {
  AnalyzedShelfProduct,
  ShelfOverlayMode,
} from "@/types/shelf";
import { mockDetectedProducts, mockIdentifiedProducts, mockAnalyzedProducts } from "@/data/mock-shelf";
import ShelfScanner from "@/components/shelf/ShelfScanner";
import ShelfOverlay from "@/components/shelf/ShelfOverlay";
import ShelfProductDetail from "@/components/shelf/ShelfProductDetail";
import ShelfSortToggle from "@/components/shelf/ShelfSortToggle";

type ScanPhase =
  | "idle"
  | "capturing"
  | "detecting"
  | "identifying"
  | "analyzing"
  | "complete";

export default function ShelfPage() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [overlayMode, setOverlayMode] = useState<ShelfOverlayMode>("score");
  const [selectedProduct, setSelectedProduct] = useState<AnalyzedShelfProduct | null>(null);
  const [products, setProducts] = useState<AnalyzedShelfProduct[]>([]);
  const [detectedCount, setDetectedCount] = useState(0);
  const [identifiedCount, setIdentifiedCount] = useState(0);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleCapture = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageUrl(dataUrl);
      setPhase("detecting");

      await delay(1200);
      const detected = mockDetectedProducts;
      setDetectedCount(detected.length);
      setTotalCount(detected.length);

      setPhase("identifying");
      await delay(1000);
      setIdentifiedCount(mockIdentifiedProducts.length);

      setPhase("analyzing");
      const analyzed = mockAnalyzedProducts;
      for (let i = 0; i < analyzed.length; i++) {
        await delay(300);
        setAnalyzedCount(i + 1);
      }
      setProducts(analyzed);

      setPhase("complete");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setImageUrl("");
    setProducts([]);
    setSelectedProduct(null);
    setDetectedCount(0);
    setIdentifiedCount(0);
    setAnalyzedCount(0);
    setTotalCount(0);
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

        {(phase === "detecting" || phase === "identifying" || phase === "analyzing") && (
          <div className="flex w-full flex-col items-center gap-4">
            {imageUrl && (
              <div className="relative w-full overflow-hidden rounded-xl border border-border">
                <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
                  <img
                    src={imageUrl}
                    alt="Shelf being scanned"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                  {phase !== "detecting" &&
                    mockDetectedProducts.map((d, i) => (
                      <div
                        key={i}
                        className="absolute rounded border-2 border-accent/40"
                        style={{
                          left: `${d.bounding_box.x}%`,
                          top: `${d.bounding_box.y}%`,
                          width: `${d.bounding_box.width}%`,
                          height: `${d.bounding_box.height}%`,
                        }}
                      >
                        {(phase === "analyzing" || phase === "identifying") && (
                          <span className="absolute bottom-0 left-0 right-0 truncate bg-surface-dark/60 px-1 py-0.5 text-[9px] font-light text-white">
                            {mockIdentifiedProducts[i]?.product.product_name ?? "..."}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="eco-card flex w-full flex-col items-center gap-3 p-6">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
              {phase === "detecting" && (
                <p className="text-sm font-light text-muted">Detecting products...</p>
              )}
              {phase === "identifying" && (
                <p className="text-sm font-light text-muted">
                  Identifying {detectedCount} products...
                </p>
              )}
              {phase === "analyzing" && (
                <p className="text-sm font-light text-muted">
                  Analyzing sustainability... {analyzedCount}/{totalCount}
                </p>
              )}
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
