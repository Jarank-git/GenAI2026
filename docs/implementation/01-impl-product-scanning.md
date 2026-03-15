# Implementation Plan: Product Scanning & Identification

> Design doc: `docs/design/01-product-scanning-identification.md`

## Current Status: REAL API INTEGRATION PHASE
- Scaffolding: COMPLETE — all services, components, orchestrators, types, and mock data are built
- Cloudinary integration (upload, OCR, barcode): Services exist with mock fallbacks, need to verify real API calls work with our keys
- Gemini product identification: Service exists with mock fallback, need to verify real API calls work
- Open Food Facts: Already works (no key needed)
- **Goal: Get real product data flowing — scan a real product image and get back real identification, not mock data**

## Prerequisites

- Cloudinary account with API keys configured — **AVAILABLE in `.env.local`**
- Gemini API key with vision capabilities enabled — **AVAILABLE in `.env.local`**
- Open Food Facts API access (no key required) — **works, no key needed**
- Google Maps API key — **NOT YET AVAILABLE** (not needed for this feature)
- PC Express API key — **NOT YET AVAILABLE** (not needed for this feature)
- No feature dependencies — this is a foundational feature

## API Configuration

API keys are configured in `.env.local`. Services should use real APIs and only fall back to mock data when keys are missing.

## Files That Need Real API Verification

The following source files were built during the scaffolding phase and need to be checked/updated to ensure they make real API calls correctly:

- `src/services/cloudinary/upload.ts` — verify real Cloudinary upload works
- `src/services/cloudinary/ocr.ts` — verify real OCR extraction works
- `src/services/cloudinary/barcode.ts` — verify real barcode detection works
- `src/services/gemini/identify.ts` — verify real Gemini identification works
- `src/services/open-food-facts.ts` — already real, verify it works
- `src/orchestrators/scan-pipeline.ts` — verify full pipeline works end-to-end with real APIs

## Build Order

### Step 1: Cloudinary Image Upload Service

Create a service module that handles image upload and processing.

- Configure Cloudinary SDK with project credentials
- Implement `uploadProductImage(imageFile)` → returns Cloudinary URL + asset ID
- Apply upload transformations: auto-brightness, contrast normalization, quality optimization
- Handle upload errors, file size limits (max 10MB), and supported formats (JPEG, PNG, HEIC)
- Return the hosted image URL for downstream processing

### Step 2: Barcode Detection Module

Build barcode extraction as the fast-path identification route.

- Use Cloudinary's barcode detection API or integrate a client-side barcode library
- Implement `detectBarcode(imageUrl)` → returns UPC/EAN string or null
- If barcode found → skip to Step 4 (Open Food Facts lookup)
- If no barcode → proceed to Step 3 (OCR path)

### Step 3: OCR Text Extraction

Extract readable text from product labels via Cloudinary.

- Use Cloudinary's OCR add-on (Google Vision OCR or AWS Textract)
- Implement `extractLabelText(imageUrl)` → returns `{ ocr_text[], brand_detected?, confidence }`
- Parse OCR output to isolate: brand name, product name, weight/volume, ingredients
- Handle multilingual labels (English + French for Canadian products)

### Step 4: Open Food Facts Lookup

Query Open Food Facts for barcode matches before hitting Gemini.

- Implement `lookupByBarcode(barcode)` → returns product data or null
- API endpoint: `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Extract: product_name, brand, categories, eco-score, packaging, image URLs
- If match found with high confidence → return directly, skip Gemini identification
- If no match or low confidence → proceed to Step 5

### Step 5: Gemini Product Identification

Use Gemini to identify the product from image + OCR data.

- Build the identification prompt with structured output instructions
- Input: Cloudinary image URL + OCR text + barcode (if any) + Open Food Facts partial match
- Prompt Gemini to return JSON: `{ product_name, brand, category, weight_volume, confidence }`
- Enforce structured output via Gemini's JSON mode or response schema
- Apply confidence threshold: >= 0.8 auto-proceed, < 0.8 trigger disambiguation

### Step 6: Disambiguation UI Component

Build the confirmation/correction screen for low-confidence matches.

- Create a component that displays top 3 candidate products
- Show product image (from Open Food Facts or Cloudinary), name, brand for each candidate
- User taps to confirm the correct match
- Include "None of these — search manually" option with text input fallback
- On selection → feed confirmed product into the pipeline (pricing + scoring)

### Step 7: Product Identification Cache

Cache identified products to skip Gemini on repeat scans.

- Cache key: barcode (if available) or hash of OCR text
- Store: `{ product_id, product_name, brand, category, weight_volume }`
- TTL: 30 days (product identity doesn't change)
- Check cache BEFORE hitting Open Food Facts or Gemini

### Step 8: Pipeline Trigger

Wire the identification output to downstream features.

- On confirmed product identification, emit/return the product data object
- This triggers parallel calls to:
  - Multi-Layer Pricing (Feature 02) — fetch prices at nearby stores
  - Sustainability Scoring (Feature 03) — calculate scores
  - Externality Pricing (Feature 06) — calculate hidden costs
- Implement as an event/callback or orchestrator function that dispatches all three

## Key Files to Create

```
src/services/cloudinary.ts       — upload, OCR, barcode detection
src/services/openFoodFacts.ts    — barcode lookup
src/services/geminiIdentify.ts   — product identification prompt + parsing
src/services/productCache.ts     — identification cache layer
src/components/ScanCamera.tsx     — camera capture UI
src/components/Disambiguation.tsx — product confirmation UI
src/orchestrators/scanPipeline.ts — wires identification → downstream features
```

## Testing Approach

- Unit test each service with mocked API responses
- Test with real images: clear barcode, clear label, blurry label, no label, non-food item
- Measure identification accuracy across 20+ test products
- Test disambiguation flow: low confidence → user correction → pipeline continues
- Verify cache hit/miss behavior on repeat scans

## Definition of Done

- User can photograph a product and see it correctly identified within 5 seconds
- Barcode path works for products in Open Food Facts database
- OCR + Gemini path works for products without barcodes
- Low-confidence matches trigger disambiguation with user correction
- Confirmed product data flows to downstream features (pricing, scoring, externality)
- Identification cache prevents redundant API calls on repeat scans
