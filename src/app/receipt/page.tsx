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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">Receipt Scanner</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {state === "idle" && !result && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                Scan Your Receipt
              </h2>
              <p className="mt-1 text-sm text-gray-500">
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setState("idle");
              }}
              className="mt-2 text-sm font-medium text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        {state === "complete" && result && (
          <div className="flex flex-col gap-4">
            <SustainabilityReceiptView receipt={result} />

            {result.optimized_basket && (
              <div className="flex flex-col gap-3">
                {!showSwaps ? (
                  <button
                    onClick={() => setShowSwaps(true)}
                    className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                  >
                    Show Me the Swaps
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowSwaps(false)}
                      className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
              className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Scan Another Receipt
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
