"use client";

import type { AnalyzedShelfProduct, ShelfOverlayMode } from "@/types/shelf";

interface ShelfOverlayProps {
  imageUrl: string;
  products: AnalyzedShelfProduct[];
  mode: ShelfOverlayMode;
  onProductTap: (product: AnalyzedShelfProduct) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "border-green-500";
  if (score >= 60) return "border-lime-500";
  if (score >= 40) return "border-orange-400";
  return "border-red-500";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-lime-500";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-500";
}

function getPriceColor(price: number): string {
  if (price <= 1.5) return "border-green-500";
  if (price <= 3.0) return "border-lime-500";
  if (price <= 4.0) return "border-orange-400";
  return "border-red-500";
}

function getPriceBgColor(price: number): string {
  if (price <= 1.5) return "bg-green-500";
  if (price <= 3.0) return "bg-lime-500";
  if (price <= 4.0) return "bg-orange-400";
  return "bg-red-500";
}

function getRatioStars(score: number, price: number): number {
  if (price <= 0) return 3;
  const ratio = score / price;
  if (ratio >= 25) return 5;
  if (ratio >= 18) return 4;
  if (ratio >= 12) return 3;
  if (ratio >= 6) return 2;
  return 1;
}

function getRatioColor(stars: number): string {
  if (stars >= 4) return "border-green-500";
  if (stars >= 3) return "border-lime-500";
  if (stars >= 2) return "border-orange-400";
  return "border-red-500";
}

function getRatioBgColor(stars: number): string {
  if (stars >= 4) return "bg-green-500";
  if (stars >= 3) return "bg-lime-500";
  if (stars >= 2) return "bg-orange-400";
  return "bg-red-500";
}

function getBorderColor(product: AnalyzedShelfProduct, mode: ShelfOverlayMode): string {
  if (mode === "score") {
    return getScoreColor(product.sustainability?.final_score ?? 0);
  }
  if (mode === "price") {
    return getPriceColor(product.price?.price ?? 0);
  }
  const score = product.sustainability?.final_score ?? 0;
  const price = product.price?.price ?? 1;
  const stars = getRatioStars(score, price);
  return getRatioColor(stars);
}

function getBadgeBg(product: AnalyzedShelfProduct, mode: ShelfOverlayMode): string {
  if (mode === "score") {
    return getScoreBgColor(product.sustainability?.final_score ?? 0);
  }
  if (mode === "price") {
    return getPriceBgColor(product.price?.price ?? 0);
  }
  const score = product.sustainability?.final_score ?? 0;
  const price = product.price?.price ?? 1;
  const stars = getRatioStars(score, price);
  return getRatioBgColor(stars);
}

function getBadgeText(product: AnalyzedShelfProduct, mode: ShelfOverlayMode): string {
  if (mode === "score") {
    return `${product.sustainability?.final_score ?? "?"}`;
  }
  if (mode === "price") {
    const price = product.price?.price;
    return price != null ? `$${price.toFixed(2)}` : "N/A";
  }
  const score = product.sustainability?.final_score ?? 0;
  const price = product.price?.price ?? 1;
  const stars = getRatioStars(score, price);
  return "\u2605".repeat(stars);
}

export default function ShelfOverlay({
  imageUrl,
  products,
  mode,
  onProductTap,
}: ShelfOverlayProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-200">
      <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
        <img
          src={imageUrl}
          alt="Grocery shelf"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {products.map((product) => {
          const box = product.detected.bounding_box;
          const borderColor = getBorderColor(product, mode);
          const badgeBg = getBadgeBg(product, mode);
          const badgeText = getBadgeText(product, mode);

          return (
            <button
              key={product.product.product_id}
              onClick={() => onProductTap(product)}
              className={`absolute rounded-md border-2 transition-all hover:border-3 hover:shadow-lg ${borderColor}`}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
              aria-label={`View details for ${product.product.product_name}`}
            >
              <span
                className={`absolute -top-2.5 -right-2.5 flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md ${badgeBg}`}
              >
                {badgeText}
              </span>
              {product.is_best_on_shelf && (
                <span className="absolute -top-3 -left-2 flex items-center gap-0.5 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold text-yellow-900 shadow-md">
                  {"\u2605"} Best
                </span>
              )}
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                {product.product.product_name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
