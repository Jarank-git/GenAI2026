# Feature Design: Multi-Layer Pricing Architecture

## Overview

A three-layer system that ensures every price shown to users is real — never hallucinated.
Addresses the fundamental LLM limitation: Gemini will fabricate prices if asked to guess.

## Problem Statement

LLMs hallucinate prices. No single Canadian pricing API covers all stores. EcoLens needs
real-time, accurate pricing across Loblaw banners, Walmart, Metro, Sobeys, and specialty
retailers — with transparent confidence indicators so users know what's verified vs estimated.

## Architecture

### Layer 1 — PC Express Internal API (Primary, Structured)

- **Endpoint**: `POST https://api.pcexpress.ca/product-facade/v3/products/search`
- **Headers required**: `X-Apikey`, `Site-Banner` (e.g., `loblaws`, `nofrills`, `superstore`)
- **Coverage**: Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, Valu-mart,
  Your Independent Grocer, Fortinos, Zehrs, all Loblaw banners
- **Returns**: product name, brand, price, unit price, size, availability, category, images
- **Confidence**: HIGH — structured JSON, real-time inventory pricing
- **Tag**: `✓ Verified`

### Layer 2 — Gemini with Google Search Grounding (Fallback, Live Web)

- **Trigger**: product not found in Layer 1, or store is non-Loblaw
- **Mechanism**: Gemini issues live Google Search queries autonomously
  (e.g., "Barilla penne price Walmart Canada March 2026")
- **Sources found**: Flipp.com flyer deals, RedFlagDeals posts, retailer flyer pages,
  Google Shopping results
- **Cost**: ~$14 per 1,000 search queries; free tier: 500-1,500/day
- **Confidence**: MEDIUM — real search results, but may reflect flyer/sale prices, not current shelf
- **Tag**: `~ Web estimate`

### Layer 3 — Gemini URL Context (Supplementary)

- **Trigger**: specific retailer product page URL already known
- **Mechanism**: Gemini fetches and reads the URL directly (up to 20 URLs per request)
- **Limitation**: most Canadian grocery sites are JS-heavy SPAs — unreliable for dynamic pages
- **Use case**: only when URL is known to be static/cached
- **Fallback**: if extraction fails → fall back to Layer 2

## Pricing Resolution Flow

```
Product identified
  │
  ├─→ Layer 1: Query PC Express API for all Loblaw banners
  │     └─ Results: verified prices per banner/store
  │
  ├─→ Layer 2: Gemini + Google Search Grounding (parallel)
  │     └─ Query for: Walmart, Metro, Sobeys, Save-On-Foods, etc.
  │     └─ Results: web-estimated prices with source URLs
  │
  └─→ Layer 3: If known product page URLs exist
        └─ Direct URL fetch for price extraction
        └─ Fallback to Layer 2 on failure

Merge results → deduplicate → attach confidence tags → return
```

## Anti-Hallucination Safeguards

1. Gemini NEVER generates prices from training data — only from Layer 1 API or Layer 2 search
2. Every price carries a source: API response (L1) or source URL (L2)
3. Missing data shown as missing: "Price unavailable — visit store or check flyer"
4. Confidence indicators visible to user on every price

## Confidence Display

| Tag | Source | Meaning |
|-----|--------|---------|
| `✓ Verified` | Layer 1 (PC Express API) | Real-time structured data |
| `~ Web estimate` | Layer 2 (Grounded Search) | From indexed flyer/web data |
| `— Unavailable` | No data found | No price from any layer |

## Caching Strategy

- **Layer 1**: 24-hour cache (aligned with daily price updates)
- **Layer 2**: 48-hour cache (flyer cycles are weekly; 48h balances freshness vs API cost)
- **Cache key**: `{product_id}:{store_id}:{banner}`
- **Invalidation**: manual flush available; auto-expire on TTL

## Cost Model

- Layer 1: free (unofficial API, no rate limit documented)
- Layer 2: ~$0.014 per grounded search query
- Layer 3: included in Gemini token cost
- Per single product scan: ~1 Layer 1 call + 3-5 Layer 2 calls = ~$0.04-0.07
- Per receipt scan (20 items): ~20 Layer 1 + up to 60 Layer 2 = ~$0.84-1.40

## Risks

- PC Express API is unofficial — keys may rotate, endpoints may change without notice
- Google Search Grounding may not index prices for niche/store-brand items
- Layer 3 unreliable for JS-rendered sites (most Canadian grocery)

## Dependencies

- PC Express API (unofficial, Loblaw internal)
- Gemini API with Google Search Grounding enabled
- Gemini URL Context tool

## Open Questions

- API key rotation monitoring strategy for PC Express?
- Should we build a scraping fallback for critical non-Loblaw retailers?
- How to handle regional price differences within the same banner?
- Rate limiting strategy when multiple features hit pricing simultaneously?
