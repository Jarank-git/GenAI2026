"use client";

import { useState } from "react";
import Link from "next/link";
import type { SustainabilityReceipt } from "@/types/receipt";
import ReceiptUpload from "@/components/receipt/ReceiptUpload";
import SustainabilityReceiptView from "@/components/receipt/SustainabilityReceiptView";
import OptimizedBasketView from "@/components/receipt/OptimizedBasketView";

type FlowState = "idle" | "uploading" | "parsing" | "analyzing" | "complete";

const LOADING_MESSAGES: Record<string, string> = {
  uploading: "Extracting items from receipt...",
  parsing: "Matching products...",
  analyzing: "Analyzing sustainability...",
};

export default function ReceiptPage() {
  const [state, setState] = useState<FlowState>("idle");
  const [result, setResult] = useState<SustainabilityReceipt | null>(null);
  const [showSwaps, setShowSwaps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setError(null);
    setState("uploading");

    try {
      await new Promise((r) => setTimeout(r, 500));
      setState("parsing");

      await new Promise((r) => setTimeout(r, 500));
      setState("analyzing");

      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data: SustainabilityReceipt = await response.json();
      setResult(data);
      setState("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
  }

  const isLoading = state === "uploading" || state === "parsing" || state === "analyzing";

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
          <h1 className="text-editorial text-lg text-foreground">Receipt Scanner</h1>
        </div>
      </header>

      <main className="page-content">
        {state === "idle" && !result && (
          <div className="animate-fade-up flex flex-col gap-5">
            <div className="text-center">
              <p className="section-label mb-3">Receipt Analysis</p>
              <h2 className="text-editorial text-2xl text-foreground">
                Scan Your <em className="text-accent">Receipt</em>
              </h2>
              <p className="mt-2 text-sm font-light text-muted">
                See the true sustainability cost of your grocery trip
              </p>
            </div>
            <ReceiptUpload
              onUpload={handleUpload}
              isLoading={false}
              loadingMessage=""
            />
          </div>
        )}

        {isLoading && (
          <ReceiptUpload
            onUpload={handleUpload}
            isLoading={true}
            loadingMessage={LOADING_MESSAGES[state] || "Processing..."}
          />
        )}

        {error && (
          <div className="animate-scale-in rounded-xl border border-eco-red/20 bg-eco-red/5 p-4 text-center">
            <p className="text-sm font-light text-eco-red">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setState("idle");
              }}
              className="mt-3 text-sm font-medium text-eco-red underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {state === "complete" && result && (
          <div className="animate-fade-up flex flex-col gap-4">
            <SustainabilityReceiptView receipt={result} />

            {result.optimized_basket && (
              <div className="flex flex-col gap-3">
                {!showSwaps ? (
                  <button
                    onClick={() => setShowSwaps(true)}
                    className="btn-primary w-full"
                  >
                    Show Me the Swaps
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowSwaps(false)}
                      className="btn-secondary w-full"
                    >
                      Hide Swaps
                    </button>
                    <OptimizedBasketView
                      basket={result.optimized_basket}
                      currentScore={result.overall_score}
                      currentCost={result.total_spent}
                    />
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setShowSwaps(false);
                setState("idle");
              }}
              className="btn-secondary w-full"
            >
              Scan Another Receipt
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
