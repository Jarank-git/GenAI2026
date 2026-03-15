# EcoLens — Project Intelligence

> Canadian-focused sustainability app that reveals the true cost of products — environmental,
> ethical, and financial — personalized to the user's location and circumstances.

## Development Phase: REAL API INTEGRATION

> **The scaffolding phase is COMPLETE.** All services, components, orchestrators, types, and
> mock data are built. The codebase compiles with zero TypeScript errors.
>
> **The current goal is to get real data flowing from APIs.** We have Gemini and Cloudinary
> API keys configured in `.env.local`. Every service that touches these APIs should return
> real data, not mock data. Mock fallbacks should only activate when API keys are missing.
>
> **Available API keys:**
> - `GEMINI_API_KEY` — Google Gemini 2.0 Flash (product ID, grounded search pricing, sustainability research, lifecycle research, fuzzy matching, batch shelf ID)
> - `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` + `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — image upload, OCR, barcode detection, receipt OCR, shelf multi-detection
> - Open Food Facts — no key needed, public API, already works
>
> **NOT available (stay mock-first):**
> - `GOOGLE_MAPS_API_KEY` — geocoding uses postal prefix fallback
> - `PC_EXPRESS_API_KEY` — Layer 1 pricing uses mock data

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack dev server)
- **Runtime**: React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4 (via @tailwindcss/postcss)
- **Deployment**: Vercel (zero-config, auto-detected from next.config.ts)
- **Dev command**: `npm run dev` (uses `next dev --turbopack`)

## Quick Orientation

- **Master spec**: `hackathon-plan.md` — the full product vision and technical architecture
- **Design docs**: `docs/design/` — one per feature, covers what and why
- **Implementation plans**: `docs/implementation/` — one per feature, covers how (step-by-step)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home / landing page
│   ├── scan/               # Product scan page (Feature 01)
│   ├── receipt/            # Receipt scan page (Feature 07) — mock-only
│   ├── shelf/              # Shelf scan page (Feature 08) — mock-only, API not wired
│   ├── onboarding/         # User profile setup (Feature 05)
│   ├── demo/               # Sorting modes demo (Feature 04) — mock data
│   └── api/                # Route handlers (server-side)
│       ├── scan/route.ts       → Feature 01 ✅
│       ├── pricing/route.ts    → Feature 02 ✅
│       ├── score/route.ts      → Feature 03 ✅
│       ├── externality/route.ts → Feature 06 ✅
│       ├── receipt/route.ts    → Feature 07 ⚠️ (services mock-locked)
│       └── shelf/route.ts     → Feature 08 ⚠️ (page doesn't call this)
├── components/             # React components by feature
│   ├── scan/               # CameraCapture, Disambiguation, ProductResult
│   ├── comparison/         # SortBar, AlternativeCard, ComparisonView, ScannedProductCard
│   ├── externality/        # ExternalityBreakdown, CostComparison
│   ├── receipt/            # ReceiptUpload, SustainabilityReceiptView, OptimizedBasketView, SwapCard
│   ├── shelf/              # ShelfScanner, ShelfOverlay, ShelfProductDetail, ShelfSortToggle
│   └── onboarding/         # PostalCodeStep, VehicleStep, ConfirmationStep
├── services/               # API clients + business logic
│   ├── cloudinary/         # Image upload, OCR, barcode detection
│   ├── gemini/             # Gemini 2.0 Flash product identification
│   ├── pricing/            # 3-layer pricing (pcExpress, groundedSearch, urlContext)
│   ├── scoring/            # Sustainability scoring engine (6 modules)
│   ├── externality/        # Carbon, water, packaging, land-use, lifecycle calculators
│   ├── hyperlocal/         # Context engine (geocoding, grid, water, recycling, seasonal, vehicle, gas)
│   ├── receipt/            # Receipt OCR, parser, fuzzy matching, batch analysis, optimized basket
│   ├── shelf/              # Multi-detection, batch-identify (stub), parallel analysis, cache
│   ├── open-food-facts.ts  # Product database lookup
│   └── product-cache.ts    # 30-day in-memory product cache
├── orchestrators/          # Pipeline coordinators
│   ├── scan-pipeline.ts        # Cloudinary → cache → OFF → Gemini
│   ├── pricing-pipeline.ts     # PC Express + Grounded Search → aggregate → gas cost
│   ├── scoring-pipeline.ts     # Gemini research + OFF → base score → hyperlocal adjust
│   └── externality-pipeline.ts # Lifecycle → carbon/water/packaging/land → total cost
├── config/                 # Category weights, externality pricing constants
├── types/                  # Product, Scoring, Pricing, Externality, UserProfile, Receipt, Shelf, Alternatives
├── data/                   # Static data (grid-intensity.json, nrcan-vehicles.json, seasonal-produce.json) + mock data
└── lib/                    # env.ts, profile-storage.ts, sorting.ts, ratio-stars.ts
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in API keys. Required keys:
- `GEMINI_API_KEY` — Google Gemini API
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GOOGLE_MAPS_API_KEY` — Maps Platform
- `PC_EXPRESS_API_KEY` — Loblaw pricing (optional, unofficial)

## Feature Map — Read These Before Working on Any Feature

Every feature has a paired design doc + implementation plan. **Always read BOTH before
starting work on a feature.** Design docs explain the what/why. Implementation plans
explain the how/order.

| # | Feature | Design Doc | Implementation Plan |
|---|---------|-----------|-------------------|
| 01 | Product Scanning & Identification | `docs/design/01-product-scanning-identification.md` | `docs/implementation/01-impl-product-scanning.md` |
| 02 | Multi-Layer Pricing Architecture | `docs/design/02-multi-layer-pricing.md` | `docs/implementation/02-impl-multi-layer-pricing.md` |
| 03 | Sustainability Scoring Algorithm | `docs/design/03-sustainability-scoring.md` | `docs/implementation/03-impl-sustainability-scoring.md` |
| 04 | Four Sorting Modes | `docs/design/04-sorting-modes.md` | `docs/implementation/04-impl-sorting-modes.md` |
| 05 | Hyperlocal Context Engine | `docs/design/05-hyperlocal-context-engine.md` | `docs/implementation/05-impl-hyperlocal-context.md` |
| 06 | True Cost Externality Pricing | `docs/design/06-externality-pricing.md` | `docs/implementation/06-impl-externality-pricing.md` |
| 07 | Receipt Scanning | `docs/design/07-receipt-scanning.md` | `docs/implementation/07-impl-receipt-scanning.md` |
| 08 | AR Shelf Scanner | `docs/design/08-ar-shelf-scanner.md` | `docs/implementation/08-impl-ar-shelf-scanner.md` |

## Dependency Graph — Build Order Matters

Features depend on each other. Build in this order to avoid blocked work:

```
PHASE 1 — Foundations (no dependencies, build in parallel)
  ├── Feature 05: Hyperlocal Context Engine
  └── Feature 01: Product Scanning & Identification

PHASE 2 — Core Pipeline (depends on Phase 1)
  ├── Feature 02: Multi-Layer Pricing      ← needs 01 (product identity)
  ├── Feature 03: Sustainability Scoring   ← needs 01 + 05 (product + hyperlocal)
  └── Feature 06: Externality Pricing      ← needs 01 + 05 (product + hyperlocal)

PHASE 3 — Interaction Layer (depends on Phase 2)
  └── Feature 04: Sorting Modes            ← needs 02 + 03 + 06 (all data dimensions)

PHASE 4 — Advanced Features (depends on full pipeline)
  ├── Feature 07: Receipt Scanning         ← needs 01 + 02 + 03 + 06
  └── Feature 08: AR Shelf Scanner         ← needs 01 + 02 + 03 + 06
```

## Routing Guide — Which Docs to Read for Common Tasks

**"I'm building the camera/scanning experience"**
→ Read: 01 design + 01 implementation

**"I'm working on pricing / fetching product prices"**
→ Read: 02 design + 02 implementation
→ Also check: 01 (product identity feeds into pricing)

**"I'm working on sustainability scores"**
→ Read: 03 design + 03 implementation
→ Also check: 05 (hyperlocal adjustments modify scores)

**"I'm building the comparison/results view"**
→ Read: 04 design + 04 implementation
→ Also check: 02 (prices), 03 (scores), 06 (externalities) — all feed into sorting

**"I'm working on personalization / user location"**
→ Read: 05 design + 05 implementation
→ This feeds into: 03 (score adjustments), 06 (externality adjustments), 02 (gas cost)

**"I'm working on externality / true cost calculations"**
→ Read: 06 design + 06 implementation
→ Also check: 05 (hyperlocal adjustments for water/carbon/packaging)

**"I'm building receipt scanning"**
→ Read: 07 design + 07 implementation
→ Also check: 01 (reuses identification), 02 (prices alternatives), 03 (scores items), 06 (externalities)

**"I'm building AR / shelf scanning"**
→ Read: 08 design + 08 implementation
→ Also check: 01 (reuses identification), 02 (prices products), 03 (scores products), 06 (externalities)

**"I need to understand the full data flow"**
→ Read: `hackathon-plan.md` for the complete picture, then the relevant feature docs

## Cross-Cutting Concerns

### Shared Services (used by multiple features)

| Service | Used By | Purpose |
|---------|---------|---------|
| Cloudinary SDK | 01, 07, 08 | Image processing, OCR, object detection |
| Gemini API | 01, 02, 03, 05, 06, 07, 08 | Product ID, research, scoring, pricing |
| Google Maps API | 02, 03, 05 | Distance, geocoding, store locations |
| Open Food Facts API | 01, 03 | Product database, eco-scores |
| PC Express API | 02 | Loblaw banner pricing |

### Key Data Types (shared across features)

- `Product` — identified product (from Feature 01), consumed by all downstream features
- `UserProfile` — personalization context (from Feature 05), consumed by 02, 03, 04, 06
- `PriceResult` — pricing with confidence tags (from Feature 02), consumed by 04, 07, 08
- `SustainabilityScore` — scored product (from Feature 03), consumed by 04, 06, 07, 08
- `ExternalityCost` — monetized hidden cost (from Feature 06), consumed by 04, 07, 08

### Anti-Hallucination Rule

Gemini NEVER generates prices from training data. All prices must come from:
- Layer 1: PC Express API (verified)
- Layer 2: Gemini with Google Search Grounding (web estimate with source URL)
- Missing prices shown as "unavailable", never fabricated

### Cost Terminology (use consistently everywhere)

- **Out-of-Pocket Cost** = shelf price + gas cost to store
- **Externality Cost** = monetized environmental damage
- **Total Cost** = out-of-pocket + externality

### Caching Strategy

- Product identification: 30-day TTL (product identity stable)
- Layer 1 prices: 24-hour TTL (daily updates)
- Layer 2 prices: 48-hour TTL (flyer cycles)
- Sustainability scores: 24-hour TTL (hyperlocal may change)
- Externality costs: 24-hour TTL
- Hyperlocal data: varies by dimension (see Feature 05 implementation)

## Implementation Status (as of 2026-03-15)

> See `docs/STATUS.md` for full details on every service, known bugs, and remaining work.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 01 | Product Scanning | **Done** | Full pipeline: Cloudinary → cache → OFF → Gemini. Real APIs with mock fallbacks. |
| 02 | Multi-Layer Pricing | **Done** | 3-layer pricing wired. PC Express + Grounded Search + URL Context. |
| 03 | Sustainability Scoring | **Done** | Gemini research + OFF enrichment + hyperlocal adjustments. |
| 04 | Sorting Modes | **Done** | All 4 modes implemented. Only used in demo page — not yet reachable from scan flow. |
| 05 | Hyperlocal Context | **Done** | All 7 dimensions implemented. Recycling/gas use mock fallbacks. |
| 06 | Externality Pricing | **Done** | All 5 cost calculators. Lifecycle research now uses Gemini 2.5 Flash with mock fallback. |
| 07 | Receipt Scanning | **Partial** | UI + API route done. All receipt services hardcode `USE_MOCK = true`. |
| 08 | AR Shelf Scanner | **Partial** | UI + API route exist. Page uses mock data only — never calls API. `batch-identify.ts` is a stub. |

### Known Bugs (do not fix without testing first)

1. ~~**ProductResult race condition**~~ — **FIXED**. Externality fetch now chains after pricing resolves.
2. ~~**Pricing pipeline TTL**~~ — **NOT A BUG**. `cachePrices(..., 1)` passes layer number (1 = 24h TTL), not TTL value.
3. ~~**Shelf page not wired**~~ — **FIXED**. Shelf page now calls `/api/shelf` with real FormData upload.
4. ~~**Receipt services mock-locked**~~ — **FIXED**. All 4 receipt services now check env vars (`CLOUDINARY_API_KEY`, `GEMINI_API_KEY`) and use real APIs when available, with mock as fallback.
5. **url-context.ts no fallback** — Returns `null` without API key; no mock data path.
6. ~~**Gemini 2.0 Flash deprecated**~~ — **FIXED**. Updated all 6 Gemini service files from `gemini-2.0-flash` to `gemini-2.5-flash`.
7. ~~**Flipp pricing empty results**~~ — **FIXED**. Flipp API returns data in `ecom_items` not `items`. Also fixed: single search instead of per-store queries (which killed non-Walmart results), and added fuzzy product name matching.
8. ~~**Cloudinary scan crash on upload failure**~~ — **FIXED**. Upload, OCR, and barcode now fall back to mock when real API fails or image URL is not a Cloudinary URL.
9. ~~**PC Express API access denied**~~ — **FIXED**. Migrated from deprecated `product-facade/v3` to `pcx-bff/api/v1` endpoint. New API key works. All 3 Loblaw banners (Loblaws, No Frills, Superstore) now return verified prices with product links.

### Connections Still Needed

- **Scan → Comparison**: No way to view alternatives after scanning a product. ComparisonView exists but isn't reachable from the scan flow.
