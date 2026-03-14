"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type {
  AnalyzedShelfProduct,
  ShelfOverlayMode,
  ShelfScanResult,
  DetectedProduct,
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

      // Phase 1: Detecting products
      await delay(1200);
      const detected = mockDetectedProducts;
      setDetectedCount(detected.length);
      setTotalCount(detected.length);

      // Phase 2: Identifying products
      setPhase("identifying");
      await delay(1000);
      setIdentifiedCount(mockIdentifiedProducts.length);

      // Phase 3: Analyzing sustainability
      setPhase("analyzing");
      const analyzed = mockAnalyzedProducts;
      for (let i = 0; i < analyzed.length; i++) {
        await delay(300);
        setAnalyzedCount(i + 1);
      }
      setProducts(analyzed);

      // Phase 4: Complete
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          {"\u2190"}
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Shelf Scanner</h1>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 p-4">
        {phase === "idle" && (
          <ShelfScanner onCapture={handleCapture} isLoading={false} />
        )}

        {(phase === "detecting" || phase === "identifying" || phase === "analyzing") && (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            {imageUrl && (
              <div className="relative w-full overflow-hidden rounded-xl bg-gray-200">
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
                        className="absolute rounded-md border-2 border-gray-400"
                        style={{
                          left: `${d.bounding_box.x}%`,
                          top: `${d.bounding_box.y}%`,
                          width: `${d.bounding_box.width}%`,
                          height: `${d.bounding_box.height}%`,
                        }}
                      >
                        {phase === "analyzing" || phase === "identifying" ? (
                          <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[9px] text-white">
                            {mockIdentifiedProducts[i]?.product.product_name ?? "..."}
                          </span>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
              {phase === "detecting" && (
                <p className="text-sm font-medium text-gray-600">
                  Detecting products...
                </p>
              )}
              {phase === "identifying" && (
                <p className="text-sm font-medium text-gray-600">
                  Identifying {detectedCount} products...
                </p>
              )}
              {phase === "analyzing" && (
                <p className="text-sm font-medium text-gray-600">
                  Analyzing sustainability... {analyzedCount}/{totalCount} products scored
                </p>
              )}
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            {bestProduct && (
              <div className="flex w-full items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                <span className="text-lg">{"\u2B50"}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-green-700">
                    Best on Shelf
                  </p>
                  <p className="text-sm font-bold text-green-900">
                    {bestProduct.product.product_name}
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-sm font-bold text-white">
                  {bestProduct.sustainability?.final_score ?? "?"}
                </span>
              </div>
            )}

            <ShelfOverlay
              imageUrl={imageUrl}
              products={products}
              mode={overlayMode}
              onProductTap={setSelectedProduct}
            />

            <ShelfSortToggle mode={overlayMode} onModeChange={setOverlayMode} />

            <p className="text-xs text-gray-400">
              {products.length} products analyzed &middot; Tap any product for details
            </p>

            <button
              onClick={handleReset}
              className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
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
