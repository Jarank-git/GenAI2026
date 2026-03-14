# Implementation Plan: Receipt Scanning — Retroactive Analysis

> Design doc: `docs/design/07-receipt-scanning.md`

## Prerequisites

- Feature 01 (Product Scanning) must be complete — reuses identification logic
- Feature 02 (Multi-Layer Pricing) must be complete — prices alternatives
- Feature 03 (Sustainability Scoring) must be complete — scores each item
- Feature 06 (Externality Pricing) must be complete — calculates hidden costs
- Cloudinary OCR add-on enabled
- This is a late-stage feature — build after core pipeline is working

## Build Order

### Step 1: Receipt Image Processing (Cloudinary OCR)

Build the receipt-specific image processing pipeline.

- Implement `processReceiptImage(imageFile)` → returns raw OCR text blocks
- Upload to Cloudinary with receipt-optimized transformations:
  - Deskew (straighten tilted receipts)
  - High contrast (thermal paper is often faded)
  - Grayscale conversion for cleaner OCR
- Use Cloudinary OCR add-on (Google Vision or AWS Textract)
- Return: ordered array of text blocks with bounding box positions
- Handle: crumpled receipts, partial photos, multi-section receipts

### Step 2: Receipt Parser

Extract structured line items from raw OCR text.

- Implement `parseReceiptText(ocrBlocks)` → structured receipt data
- Extract from receipt header: store name/banner, date, store address
- Extract line items: each row typically has item shorthand + price
- Parse price: handle "$X.XX", "X.XX", trailing totals, tax lines
- Filter out: subtotals, tax lines, payment method, loyalty points, barcodes
- Return:
  ```
  {
    store: { name, banner, date, address },
    items: [{ raw_text, price, quantity }],
    total: number
  }
  ```
- Handle receipt formats: Loblaw, Walmart, Metro, Sobeys, Shoppers all have different layouts

### Step 3: Fuzzy Product Matching (Gemini)

Map receipt shorthand to actual products using Gemini.

- Implement `matchReceiptItems(items, storeContext)` → matched products
- Build Gemini prompt with store context for disambiguation:
  "The following items are from a [Store Name] receipt. Map each shorthand to the
  actual product. Consider that [Store Name] carries [Banner] brands."
- Send all items in one batch prompt (more efficient than per-item)
- Gemini returns: `[{ raw_text, product_name, brand, category, confidence }]`
- Example mappings:
  - "NN ORG PENNE" at No Frills → No Name Organic Penne, 900g (HIGH confidence)
  - "PC BM WHL WHT" at Loblaws → PC Blue Menu Whole Wheat Bread (HIGH)
  - "APPLES" → generic apples (MEDIUM — variety unknown)
- Flag LOW confidence items for user review

### Step 4: Batch Analysis Pipeline

Run pricing, scoring, and externality analysis for all receipt items in parallel.

- Implement `analyzeReceiptItems(matchedItems, userContext)` → analyzed items
- For each identified item, trigger in parallel:
  - Sustainability scoring (Feature 03 pipeline)
  - Alternative product discovery + pricing (Feature 02 pipeline)
  - Externality cost calculation (Feature 06 pipeline)
- Batch Gemini calls where possible: send multiple products in one sustainability prompt
- PC Express API calls batched per banner
- Items resolve progressively — don't wait for the slowest item
- Return analyzed items as they complete (streaming/callback pattern)

### Step 5: Sustainability Receipt Generator

Compile all analyzed items into the Sustainability Receipt output.

- Implement `generateSustainabilityReceipt(analyzedItems, receiptMeta)` → receipt output
- Calculate aggregates:
  - Total spent (sum of shelf prices from receipt)
  - Total cost with externalities (sum of total costs)
  - Overall sustainability score (weighted average by price — expensive items matter more)
- Generate per-item summary: product name, price paid, sustainability score, externality cost
- Sort items by sustainability score ascending (worst items at top for visibility)
- Return structured receipt object for UI rendering

### Step 6: Optimized Basket Calculator

Calculate the "what if you swapped" recommendations.

- Implement `calculateOptimizedBasket(analyzedItems, userContext)` → swap recommendations
- Identify bottom 5 items by sustainability score (worst performers)
- For each, find the best Sweet Spot alternative:
  - Must be same category
  - Must be available at stores within user's typical radius
  - Maximize sustainability_score / total_cost ratio
- Calculate aggregate impact of all swaps:
  - New total cost, new overall score, externality savings
  - Dollar difference at checkout vs externality savings
- Return:
  ```
  {
    swaps: [{ original, replacement, score_improvement, cost_difference, store }],
    new_total_score, new_total_cost, externality_savings
  }
  ```

### Step 7: Receipt UI — Progressive Loading

Build the receipt scanning results screen with progressive loading.

- Phase 1 (~3s): show OCR results — list of raw item names as they're extracted
- Phase 2 (~5-10s): matched product names replace raw text as Gemini resolves
- Phase 3 (~10-30s): sustainability scores + externality costs stream in per item
- Show progress bar: "Analyzing: 14/18 items complete"
- Each item card transitions from "loading" → "scored" with animation
- "Sustainability Receipt" header appears once aggregates are calculable

### Step 8: Receipt Results UI

Build the final Sustainability Receipt display.

- Top section: receipt summary (store, date, total spent, total true cost, overall score)
- Item list: scrollable, each item shows name, price, score, externality
- "Optimized Basket" section: shows swap count, new score, cost difference
- "Show Me the Swaps" button → navigates to swap detail view
- Swap detail: side-by-side comparison (original vs recommended) with store locations
- "Save Receipt" → persist to local history for tracking improvement over time

## Key Files to Create

```
src/services/receipt/imageProcessing.ts    — Cloudinary receipt OCR
src/services/receipt/parser.ts             — receipt text → structured items
src/services/receipt/fuzzyMatcher.ts       — Gemini shorthand → product matching
src/services/receipt/batchAnalysis.ts      — parallel scoring/pricing/externality
src/services/receipt/receiptGenerator.ts   — aggregate sustainability receipt
src/services/receipt/optimizedBasket.ts    — swap recommendation calculator
src/components/ReceiptScanner.tsx          — camera + progress UI
src/components/SustainabilityReceipt.tsx   — final receipt display
src/components/SwapDetail.tsx              — swap recommendation detail view
src/types/receipt.ts                       — shared type definitions
```

## Testing Approach

- Test OCR with real receipt photos from various Canadian stores
- Test fuzzy matching: feed known shorthands → verify correct product mapping
- Test batch analysis: 20 items processed in < 30 seconds
- Test optimized basket: verify swaps are actually better (higher score, reasonable cost)
- Test progressive loading: UI updates as items resolve (not all-or-nothing)
- Test edge cases: partial receipt, unreadable items, non-grocery items

## Definition of Done

- User photographs receipt → items extracted via OCR within 3 seconds
- Fuzzy matching correctly identifies > 80% of items without user correction
- All items scored, priced, and externality-calculated within 30 seconds
- Sustainability Receipt displays with aggregates and per-item breakdown
- Optimized basket recommends concrete swaps with real store locations
- Progressive loading shows results as they stream in
