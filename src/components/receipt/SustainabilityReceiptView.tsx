"use client";

import type { SustainabilityReceipt } from "@/types/receipt";

interface SustainabilityReceiptViewProps {
  receipt: SustainabilityReceipt;
}

function scoreColor(score: number): string {
  if (score >= 75) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-lime-100 text-lime-800";
  if (score >= 45) return "bg-yellow-100 text-yellow-800";
  if (score >= 30) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function confidenceDot(confidence: "high" | "medium" | "low"): string {
  if (confidence === "high") return "bg-green-400";
  if (confidence === "medium") return "bg-yellow-400";
  return "bg-red-400";
}

export default function SustainabilityReceiptView({
  receipt,
}: SustainabilityReceiptViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {receipt.receipt.store.name}
            </h2>
            <p className="text-xs text-gray-500">{receipt.receipt.store.date}</p>
            <p className="text-xs text-gray-400">{receipt.receipt.store.address}</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 ${scoreColor(receipt.overall_score)}`}>
            <p className="text-xs font-medium">Score</p>
            <p className="text-xl font-bold">{receipt.overall_score}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-xs text-gray-400">Items</p>
            <p className="text-sm font-semibold text-gray-900">
              {receipt.analyzed_items.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Spent</p>
            <p className="text-sm font-semibold text-gray-900">
              ${receipt.total_spent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">True Cost</p>
            <p className="text-sm font-semibold text-red-600">
              ${receipt.total_cost_with_externalities.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Items (worst score first)
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {receipt.analyzed_items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${confidenceDot(item.match_confidence)}`}
                title={`Match: ${item.match_confidence}`}
              />

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.matched_product || item.raw_text}
                </p>
                {item.externality && (
                  <p className="text-xs text-gray-400">
                    +${item.externality.externality_cost.toFixed(2)} externality
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-gray-700">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              {item.sustainability && (
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${scoreColor(item.sustainability.final_score)}`}
                >
                  {item.sustainability.final_score}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
