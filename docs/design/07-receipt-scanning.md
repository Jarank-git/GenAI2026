# Feature Design: Receipt Scanning — Retroactive Analysis

## Current Status: REAL API INTEGRATION PHASE
- Scaffolding: COMPLETE — all UI components, API route, and service files are built
- Receipt OCR: MOCK LOCKED — `USE_MOCK = true` hardcoded in `image-processing.ts`
- Fuzzy matching: MOCK LOCKED — `USE_MOCK = true` hardcoded in `fuzzy-matcher.ts`
- Batch analysis: MOCK LOCKED — `USE_MOCK = true` hardcoded in `batch-analysis.ts`
- Optimized basket: MOCK LOCKED — `USE_MOCK = true` hardcoded in `optimized-basket.ts`
- Receipt parser: Real regex-based parser, works
- Receipt generator: Pure logic, works
- **Goal: Unlock real receipt processing — use Cloudinary OCR for real receipt images and Gemini for fuzzy matching receipt items to products**

## Overview

Photograph a grocery receipt after shopping. The app analyzes every item purchased,
generates sustainability scores, calculates true costs, and recommends an optimized basket
for next time. Zero friction entry point — meets users where they already are.

## Development Context

> API keys are configured in `.env.local`. Services should use real APIs and only fall back to mock data when keys are missing.

## Problem Statement

Nobody scans 30 products one by one while shopping. Existing sustainability apps demand
behavior change BEFORE providing value. That's backwards. EcoLens flips the model:
shop normally, then learn what you could do better. The receipt is the entry point,
not the barrier.

## User Flow

```
Open app → Tap "Scan Receipt" → Photograph receipt
  → Processing screen with progress indicators
    → Items appear progressively as they resolve:
      1. OCR extracts line items (~3 seconds)
      2. Products identified (fuzzy matching)
      3. Pricing + sustainability scores stream in per item
  → Sustainability Receipt appears
    → Tap any item for deep dive
    → Tap "Show Me Better Options" for swap recommendations
    → Tap "Save" to add to personal history
```

## Technical Pipeline

### Stage 1: OCR Extraction (Cloudinary)

- Input: photograph of receipt
- Cloudinary processes: image enhancement, deskew, OCR
- Output: structured line items with:
  - Item shorthand text (e.g., "NN ORG PENNE")
  - Price as printed
  - Quantity if shown
  - Store name/banner (from header)
  - Date of purchase

### Stage 2: Product Identification (Gemini)

- Fuzzy matching: receipt shorthand → actual product
- Gemini cross-references store context, price, abbreviation patterns
- Example mappings:
  - "NN ORG PENNE" → No Name Organic Penne, 900g
  - "PC BM WHL WHT" → PC Blue Menu Whole Wheat Bread
  - "TIDE HE LIQ" → Tide HE Liquid Detergent
- Confidence per match: HIGH / MEDIUM / LOW
- LOW confidence items flagged for user confirmation

### Stage 3: Analysis (Parallel Processing)

For each identified item, trigger in parallel:
- Sustainability scoring (via Scoring Algorithm)
- Pricing layer queries (for alternatives at nearby stores)
- Externality pricing calculation
- Alternative product discovery (Gemini)

### Stage 4: Sustainability Receipt Generation

Compile results into the final output.

## Sustainability Receipt Output

```
┌─────────────────────────────────────────────────────┐
│  SUSTAINABILITY RECEIPT                              │
│  Loblaws — March 14, 2026                           │
│                                                      │
│  Items: 18  │  Total Spent: $87.42                   │
│  Total Cost (with externalities): $134.18            │
│  Overall Sustainability Score: 54/100                │
│                                                      │
│  ── YOUR BASKET ────────────────────────────────     │
│  No Name Organic Penne ........... $2.49  [52/100]   │
│  Tide HE Liquid ................. $12.99  [38/100]   │
│  PC Free Range Eggs ............. $6.49   [71/100]   │
│  ... (all items listed)                              │
│                                                      │
│  ── OPTIMIZED BASKET ───────────────────────────     │
│  If you swapped 5 key items:                         │
│  New score: 82/100  │  New cost: $91.10              │
│  You'd pay $3.68 more but save $18.40 in externalities│
│                                                      │
│  [Show Me the Swaps]  [Save Receipt]                 │
└─────────────────────────────────────────────────────┘
```

## Optimized Basket Logic

- Identify items with lowest sustainability scores in the basket
- For each, find the best Sweet Spot alternative (highest score-to-price ratio)
- Constrain alternatives to stores within user's typical shopping radius
- Calculate aggregate impact: new total cost, new overall score, externality savings
- Present as actionable swap list with store locations

## Performance Design

- 20-item receipt triggers:
  - ~20 Layer 1 API calls (batched to PC Express)
  - Up to 20 Layer 2 grounded searches (parallelized via Gemini)
  - 1-2 batched Gemini sustainability calls (multiple products per prompt)
- Progressive loading: OCR results in ~3 seconds, then scores stream in per item
- Target: full receipt processed in 15-30 seconds
- Items render as they complete — no waiting for the slowest item

## Fuzzy Matching Challenges

Receipt shorthand is notoriously messy:
- Abbreviated brand names ("NN" = No Name, "PC" = President's Choice)
- Truncated product names (character limits on POS systems)
- Missing size/variant info
- Store-specific codes

Gemini handles this by combining:
- Store context (Loblaws receipt → Loblaw brands likely)
- Price context (helps disambiguate when multiple matches)
- Category patterns (items near each other on receipt often share categories)

## Error Handling

- **Unreadable line items**: mark as "Could not identify" with manual entry option
- **Wrong match**: user taps to correct; correction improves future matching
- **Partial receipt**: process whatever is readable; note "X items could not be processed"
- **Non-grocery receipt**: detect and inform user this feature works best with grocery receipts

## Dependencies

- Cloudinary (OCR, image processing)
- Gemini API (fuzzy matching, sustainability research, alternative discovery)
- Multi-Layer Pricing Architecture (alternative pricing)
- Sustainability Scoring Algorithm (per-item scoring)
- True Cost Externality Pricing (externality calculations)
- Google Maps API (store distances for alternatives)

## Success Metrics

- OCR accuracy: > 90% of line items correctly extracted
- Product matching: > 80% of items correctly identified without user correction
- Full receipt processing time: < 30 seconds for 20 items
- Optimized basket engagement: > 40% of users tap "Show Me the Swaps"

## Open Questions

- Should receipts persist as history for tracking improvement over time?
- How to handle non-grocery items on a mixed receipt?
