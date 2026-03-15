# Implementation Plan: Multi-Layer Pricing Architecture

## Current Status: REAL API INTEGRATION PHASE
- Scaffolding: COMPLETE — all services, components, orchestrators, types, and mock data are built
- Layer 1 (PC Express): NO API key available — stays mock for now
- Layer 2 (Gemini Grounded Search): API key available — need to verify real grounded search pricing works
- Layer 3 (URL Context): API key available — need to verify real URL context works
- Gas cost calculation: Works (pure math), but Google Maps not available for real distances
- **Goal: Get real pricing data from Gemini Grounded Search (Layer 2) — this is our primary real pricing source**

> Design doc: `docs/design/02-multi-layer-pricing.md`

## Prerequisites

- Feature 01 (Product Scanning) must be complete — pricing needs a product identity
- PC Express API key — **NOT AVAILABLE — stays mock for now**
- Gemini API key with Google Search Grounding enabled — **AVAILABLE in `.env.local`**
- In-memory cache (use a simple Map or Next.js cache — no Redis needed for dev)

## Development Context

API keys are configured in `.env.local`. Services should use real APIs and only fall back to mock data when keys are missing.

- **Layer 1 (PC Express)**: No API key available — continues to use mock data
- **Layer 2 (Gemini Grounded Search)**: Gemini API key available — should use real grounded search calls
- **Layer 3 (URL Context)**: Gemini API key available — should use real URL context calls
- **Gas cost**: Google Maps API key not available — uses hardcoded store distances

The aggregation, deduplication, gas cost calculation, and caching logic are pure code and work without API keys.

## Build Order

### Step 1: PC Express API Client (Layer 1)

Build the structured pricing client for Loblaw banner stores.

- Implement `queryPCExpress(productName, banner)` → returns price data or null
- Endpoint: `POST https://api.pcexpress.ca/product-facade/v3/products/search`
- Required headers: `X-Apikey`, `Site-Banner` (loblaws, nofrills, superstore, etc.)
- Parse response: extract price, unit_price, availability, store_id, product_url
- Query ALL banners in parallel: Loblaws, No Frills, Superstore, Shoppers, Valu-mart, etc.
- Tag results with confidence: `verified`
- Handle API errors gracefully — if PC Express is down, skip to Layer 2

### Step 2: Gemini Grounded Search Client (Layer 2)

Build the fallback pricing client using Gemini's Google Search Grounding.

- Implement `queryGroundedPrice(productName, storeName, location)` → returns price + source URL
- Configure Gemini API call with `tools: [{ google_search_retrieval: {} }]`
- Craft prompt: "Find the current price of [product] at [store] in [city], Canada. Return only verified prices from search results with source URLs."
- Parse Gemini response: extract price (CAD), source_url, confidence
- Target stores: Walmart, Metro, Sobeys, Save-On-Foods, FreshCo, Food Basics
- Tag results with confidence: `web_estimate`
- Enforce anti-hallucination: if Gemini can't find a grounded price, return null (not a guess)

### Step 3: URL Context Client (Layer 3)

Build the supplementary direct-URL price extractor.

- Implement `extractPriceFromURL(productPageUrl)` → returns price or null
- Use Gemini's URL Context tool to fetch and parse known product page URLs
- Only invoke when a URL is already known (from Layer 2 results or cached)
- Handle failures: JS-rendered pages won't work — fall back silently to Layer 2 data
- This layer is opportunistic, not required

### Step 4: Price Aggregation & Deduplication

Merge results from all layers into a unified price list.

- Implement `aggregatePrices(layer1Results, layer2Results, layer3Results)` → unified list
- Deduplicate: same product at same store from multiple layers → prefer Layer 1 (highest confidence)
- Attach confidence tags: `verified` (L1), `web_estimate` (L2), `unavailable` (no data)
- Sort by store proximity (requires user location from Hyperlocal Engine)
- Return: `[{ store_name, banner, price, unit_price, confidence_tag, source_url?, distance_km? }]`

### Step 5: Price Cache Layer

Implement caching to reduce API costs and improve response time.

- Cache key format: `price:{product_id}:{store_id}:{banner}`
- Layer 1 TTL: 24 hours (daily price updates)
- Layer 2 TTL: 48 hours (flyer cycles are weekly)
- Check cache BEFORE hitting any API layer
- Cache invalidation: manual flush endpoint + auto-expire on TTL
- Track cache hit rate for monitoring

### Step 6: Pricing Orchestrator

Wire the three layers together with fallback logic.

- Implement `fetchAllPrices(product, userLocation)` → returns aggregated price list
- Execution flow:
  1. Check cache for all known stores
  2. For cache misses: fire Layer 1 (all Loblaw banners) in parallel
  3. For non-Loblaw stores: fire Layer 2 (grounded search) in parallel
  4. For any known URLs: fire Layer 3 opportunistically
  5. Aggregate all results, deduplicate, attach confidence tags
  6. Cache new results
  7. Return unified price list
- Total execution: Layer 1 + Layer 2 fire in parallel → merge on completion

### Step 7: Gas Cost Calculator Integration

Add transport cost to each store's price using Hyperlocal Engine data.

- For each store in the price list, call Google Maps Distance Matrix API
- Calculate gas cost: `(distance_km × user_L_per_100km / 100) × local_gas_price`
- Compute out-of-pocket cost: `shelf_price + gas_cost`
- Attach to each price entry: `{ ...priceData, distance_km, gas_cost, out_of_pocket }`
- EV users: substitute electricity cost per km
- Transit/bike users: gas_cost = 0

## Key Files to Create

```
src/services/pricing/pcExpress.ts      — Layer 1 API client
src/services/pricing/groundedSearch.ts  — Layer 2 Gemini grounded search
src/services/pricing/urlContext.ts      — Layer 3 URL extraction
src/services/pricing/aggregator.ts      — merge, deduplicate, tag
src/services/pricing/cache.ts           — price caching layer
src/services/pricing/gasCost.ts         — transport cost calculator
src/orchestrators/pricingPipeline.ts    — orchestrates all layers
src/types/pricing.ts                    — shared type definitions
```

## Testing Approach

- Mock PC Express API responses for each banner
- Test grounded search with real Gemini calls against known products (verify no hallucination)
- Test cache hit/miss/expiry behavior
- Test aggregation with mixed Layer 1 + Layer 2 results + missing data
- Verify gas cost calculation with known distances and fuel consumption rates
- Test anti-hallucination: ensure null returned when no real price found

## Definition of Done

- Layer 1 returns verified prices for products at all Loblaw banners
- Layer 2 returns grounded web prices for non-Loblaw stores (with source URLs)
- No hallucinated prices — every price has a verifiable source
- Confidence tags (verified / web_estimate / unavailable) attached to every result
- Gas cost calculated per store using user's vehicle profile
- Caching reduces redundant API calls with appropriate TTLs
- Full price list returned within 5 seconds for a single product

## Files That Need Real API Verification

- `src/services/pricing/pc-express.ts` — NO key available, stays mock
- `src/services/pricing/grounded-search.ts` — verify real Gemini grounded search works
- `src/services/pricing/url-context.ts` — verify real URL context works, add mock fallback if missing
- `src/services/pricing/gas-cost.ts` — works, but uses hardcoded store distances (no Google Maps key)
- `src/orchestrators/pricing-pipeline.ts` — verify full pipeline with real Layer 2 data
