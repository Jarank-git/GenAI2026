# EcoLens — Implementation Status

> Last updated: 2026-03-14
>
> **CURRENT PHASE: REAL API INTEGRATION**
> Scaffolding is complete. All services, components, orchestrators, types, and mock data are built.
> The goal now is to get real data flowing from Gemini and Cloudinary APIs.
> API keys are configured in `.env.local`. See each feature's design + implementation doc for
> which files need verification or real API wiring.

## Feature Status Overview

| # | Feature | Status | UI | API | Services | Mock/Real |
|---|---------|--------|----|-----|----------|-----------|
| 01 | Product Scanning | **Done** | scan/page.tsx | /api/scan | cloudinary/, gemini/, product-cache | Real with mock fallbacks |
| 02 | Multi-Layer Pricing | **Done** | (via ProductResult) | /api/pricing | pricing/ (6 files) | Real with mock fallbacks |
| 03 | Sustainability Scoring | **Done** | (via ProductResult) | /api/score | scoring/ (6 files) | Real with mock fallbacks |
| 04 | Sorting Modes | **Done** | comparison/ (4 components) | — | lib/sorting.ts | Real — demo page only |
| 05 | Hyperlocal Context | **Done** | onboarding/page.tsx | — | hyperlocal/ (8 files) | Mixed (see below) |
| 06 | Externality Pricing | **Done** | externality/ (2 components) | /api/externality | externality/ (5 files) | Calculators real, lifecycle mock |
| 07 | Receipt Scanning | **Partial** | receipt/page.tsx + 4 components | /api/receipt | receipt/ (7 files) | All hardcoded to mock |
| 08 | AR Shelf Scanner | **Partial** | shelf/page.tsx + 4 components | /api/shelf | shelf/ (5 files) | Page uses mock only, API orphaned |

---

## Detailed Service Status

### Real Implementations (work with API keys)

| Service | File | External API | Fallback |
|---------|------|-------------|----------|
| Image upload | services/cloudinary/upload.ts | Cloudinary REST API | Mock URL |
| Barcode detection | services/cloudinary/barcode.ts | Cloudinary Analyze API | First mock product barcode |
| Label OCR | services/cloudinary/ocr.ts | Cloudinary Analyze API | Mock OCR text |
| Product identification | services/gemini/identify.ts | Gemini 2.0 Flash | Fuzzy mock match |
| Open Food Facts lookup | services/open-food-facts.ts | world.openfoodfacts.org v2 | null |
| PC Express pricing | services/pricing/pc-express.ts | api.pcexpress.ca | Mock prices |
| Grounded Search pricing | services/pricing/grounded-search.ts | Gemini + Google Search | Mock prices |
| Price aggregation | services/pricing/aggregator.ts | — (pure logic) | — |
| Gas cost calculation | services/pricing/gas-cost.ts | — (pure logic) | Mock store distances |
| Gemini sustainability | services/scoring/gemini-research.ts | Gemini 2.0 Flash | Mock sustainability data |
| OFF enrichment | services/scoring/off-enrichment.ts | Open Food Facts v2 | Skip enrichment |
| Base score calculator | services/scoring/base-calculator.ts | — (pure logic) | — |
| Transport scoring | services/scoring/transport.ts | — (pure logic) | — |
| Score interpreter | services/scoring/interpreter.ts | — (pure logic) | — |
| Hyperlocal adjustments | services/scoring/hyperlocal-adj.ts | — (pure logic) | — |
| Carbon cost | services/externality/carbon.ts | — (pure logic) | — |
| Water cost | services/externality/water.ts | — (pure logic) | — |
| Packaging cost | services/externality/packaging.ts | — (pure logic) | — |
| Land use cost | services/externality/land-use.ts | — (pure logic) | — |
| Geocoding | services/hyperlocal/geocoding.ts | Google Maps API | Postal prefix map |
| Grid emissions | services/hyperlocal/grid-emissions.ts | — (static JSON) | — |
| Seasonal produce | services/hyperlocal/seasonal.ts | — (static JSON) | — |
| Vehicle data | services/hyperlocal/vehicle-data.ts | — (static JSON) | — |
| Water stress | services/hyperlocal/water-stress.ts | — (hardcoded regions) | — |
| Hyperlocal adjustments | services/hyperlocal/adjustments.ts | — (pure logic) | — |
| Product cache | services/product-cache.ts | — (in-memory) | — |
| Price cache | services/pricing/cache.ts | — (in-memory) | — |
| Shelf cache | services/shelf/cache.ts | — (in-memory) | — |
| Receipt parser | services/receipt/parser.ts | — (regex parsing) | — |
| Receipt generator | services/receipt/receipt-generator.ts | — (pure logic) | — |

### Mock-Only / Stub Implementations

| Service | File | Issue | TODO |
|---------|------|-------|------|
| URL Context pricing | services/pricing/url-context.ts | Returns null without API key, no mock fallback | Add mock fallback |
| Lifecycle research | services/externality/lifecycle.ts | Looks up mock-lifecycle.ts only | Implement Gemini API call |
| Recycling research | services/hyperlocal/recycling.ts | Hardcoded city lookup tables | Implement Gemini API call |
| Gas price | services/hyperlocal/gas-price.ts | Hardcoded per-province prices | Real NRCan API (optional env var exists) |
| Receipt OCR | services/receipt/image-processing.ts | `USE_MOCK = true` hardcoded | Toggle via env var |
| Receipt fuzzy matching | services/receipt/fuzzy-matcher.ts | `USE_MOCK = true` hardcoded | Toggle via env var |
| Receipt batch analysis | services/receipt/batch-analysis.ts | `USE_MOCK = true` hardcoded | Toggle via env var |
| Receipt optimized basket | services/receipt/optimized-basket.ts | `USE_MOCK = true` hardcoded | Toggle via env var |
| Shelf multi-detection | services/shelf/multi-detection.ts | Returns mock without Cloudinary key | Scaffold code in comments |
| Shelf batch identify | services/shelf/batch-identify.ts | **Complete stub** — returns empty array | Needs full implementation |
| Shelf parallel analysis | services/shelf/parallel-analysis.ts | Returns mock pre-analyzed products | Real mode calls orchestrators |

---

## Known Bugs

### 1. ProductResult Race Condition (CRITICAL)
- **File**: `src/components/scan/ProductResult.tsx` (~line 78-115)
- **Problem**: Pricing, scoring, and externality API calls fire in parallel. Externality call passes `pricing?.prices?.[0]?.price` as `shelfPrice`, but `pricing` state is still `null` when the fetch starts.
- **Impact**: Externality `total_cost` calculation always missing shelf price component.
- **Fix**: Chain externality fetch after pricing resolves, or use a separate useEffect.

### 2. Pricing Pipeline Cache TTL
- **File**: `src/orchestrators/pricing-pipeline.ts:42`
- **Problem**: `cachePrices(product.product_id, withGasCosts, 1)` — the `1` looks like a TTL value but the cache function signature needs verification.
- **Impact**: Prices may be cached for wrong duration.

### 3. Shelf Page Not Wired to API
- **File**: `src/app/shelf/page.tsx`
- **Problem**: Uses `mockDetectedProducts`, `mockIdentifiedProducts`, `mockAnalyzedProducts` from data files. Never calls `/api/shelf`.
- **Impact**: Feature 08 is demo-only — real shelf scanning doesn't work.

### 4. Receipt Services Mock-Locked
- **Files**: 4 receipt service files
- **Problem**: `USE_MOCK = true` hardcoded at top of each file. No env var toggle.
- **Impact**: Receipt scanning always returns mock data regardless of available API keys.

### 5. URL Context No Fallback
- **File**: `src/services/pricing/url-context.ts`
- **Problem**: Returns `null` if no `GEMINI_API_KEY`. No mock data path.
- **Impact**: Layer 3 pricing always empty in dev/demo mode.

---

## Connections Still Needed

### Scan → Comparison Flow
The scan page identifies a product and shows its details via `ProductResult`, but there's no path to view **alternatives** and use the **sorting modes**. `ComparisonView` exists and works (visible on demo page) but is not reachable from the scan flow. Need to either:
- Add an "alternatives" tab/step after scan results
- Or link from ProductResult to a comparison page

### Shelf Page → Real API
`shelf/page.tsx` needs to be rewired to call `/api/shelf` with a real camera image instead of importing mock data. The API route and underlying services already exist.

### Receipt Mock Toggle
Replace hardcoded `USE_MOCK = true` in receipt services with an env-var-driven toggle (e.g., `process.env.USE_MOCK_RECEIPT !== 'false'`) so real Cloudinary OCR and Gemini matching can be tested.

### Lifecycle Research → Gemini
`services/externality/lifecycle.ts` has a TODO to call Gemini for real product lifecycle data (carbon, water, packaging, land use). Currently returns mock lookup or defaults.

### Recycling Research → Gemini
`services/hyperlocal/recycling.ts` has a TODO to call Gemini for real municipal recycling program data. Currently uses hardcoded city tables.

---

## Pages & Navigation

| Path | Page | Status |
|------|------|--------|
| `/` | Home / landing | Working — shows profile city, links to all features |
| `/onboarding` | Profile setup | Working — postal code, vehicle, saves to localStorage |
| `/scan` | Product scanner | Working — camera capture → API → product result |
| `/receipt` | Receipt scanner | Working (mock) — upload → mock OCR → mock analysis |
| `/shelf` | Shelf scanner | Demo only — shows mock data, no real scanning |
| `/demo` | Sorting demo | Working — mock alternatives with all 4 sort modes |

---

## Static Data Files

| File | Purpose | Quality |
|------|---------|---------|
| data/grid-intensity.json | Provincial grid CO2 intensity | Real Canadian data |
| data/nrcan-vehicles.json | Vehicle fuel efficiency | Real NRCan data |
| data/seasonal-produce.json | Monthly seasonal produce by province | Curated |
| data/mock-products.ts | 10 test products | Realistic barcodes/brands |
| data/mock-prices.ts | 10 products × 6 stores | Realistic Canadian pricing |
| data/mock-sustainability.ts | 10 products sustainability research | Detailed factors |
| data/mock-lifecycle.ts | 10 products lifecycle data | Science-based values |
| data/mock-alternatives.ts | 9 pasta alternatives | Full sort dimensions |
| data/mock-receipt.ts | Loblaws receipt + 15 items + 5 swaps | Complete flow |
| data/mock-shelf.ts | 8 pasta products with bounding boxes | Complete flow |
| data/mock-hyperlocal.ts | 4 Canadian cities context | Accurate regional data |
