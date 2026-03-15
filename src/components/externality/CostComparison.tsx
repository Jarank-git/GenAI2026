"use client";

interface ProductSummary {
  name: string;
  shelfPrice: number;
  totalCost: number;
  sustainabilityScore?: number;
}

interface CostComparisonProps {
  productA: ProductSummary;
  productB: ProductSummary;
}

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined) return null;

  let color = "bg-gray-100 text-gray-700";
  if (score >= 70) color = "bg-green-100 text-green-700";
  else if (score >= 40) color = "bg-yellow-100 text-yellow-700";
  else color = "bg-red-100 text-red-700";

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}/100
    </span>
  );
}

function ProductColumn({
  product,
  isCheaperShelf,
  isCheaperTotal,
}: {
  product: ProductSummary;
  isCheaperShelf: boolean;
  isCheaperTotal: boolean;
}) {
  const externalityCost =
    Math.round((product.totalCost - product.shelfPrice) * 100) / 100;

  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 truncate">
        {product.name}
      </h3>

      {product.sustainabilityScore !== undefined && (
        <div className="mb-3">
          <ScoreBadge score={product.sustainabilityScore} />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Shelf Price</span>
          <span
            className={`text-sm font-medium ${isCheaperShelf ? "text-green-600" : "text-gray-900"}`}
          >
            ${product.shelfPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Hidden Costs</span>
          <span className="text-sm font-medium text-red-600">
            +${externalityCost.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-700">True Cost</span>
          <span
            className={`text-base font-bold ${isCheaperTotal ? "text-green-600" : "text-red-700"}`}
          >
            ${product.totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CostComparison({
  productA,
  productB,
}: CostComparisonProps) {
  const aCheaperShelf = productA.shelfPrice <= productB.shelfPrice;
  const aCheaperTotal = productA.totalCost <= productB.totalCost;

  const shelfDiff = Math.abs(productA.shelfPrice - productB.shelfPrice);
  const totalDiff = Math.abs(productA.totalCost - productB.totalCost);
  const reversalOccurs = aCheaperShelf !== aCheaperTotal;

  const cheaperShelfName = aCheaperShelf ? productA.name : productB.name;
  const moreExpensiveShelfName = aCheaperShelf ? productB.name : productA.name;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <ProductColumn
          product={productA}
          isCheaperShelf={aCheaperShelf}
          isCheaperTotal={aCheaperTotal}
        />
        <ProductColumn
          product={productB}
          isCheaperShelf={!aCheaperShelf}
          isCheaperTotal={!aCheaperTotal}
        />
      </div>

      {reversalOccurs ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-800 text-center">
            <span className="font-semibold">{moreExpensiveShelfName}</span>{" "}
            costs ${shelfDiff.toFixed(2)} more at checkout but{" "}
            <span className="font-semibold">
              ${totalDiff.toFixed(2)} LESS
            </span>{" "}
            when you count what the planet pays.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold">{cheaperShelfName}</span> is cheaper
            both at checkout ($
            {shelfDiff.toFixed(2)} less) and in true cost ($
            {totalDiff.toFixed(2)} less).
          </p>
        </div>
      )}
    </div>
  );
}
