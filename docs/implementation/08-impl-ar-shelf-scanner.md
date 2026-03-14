# Implementation Plan: AR Shelf Scanner

> Design doc: `docs/design/08-ar-shelf-scanner.md`

## Prerequisites

- Feature 01 (Product Scanning) must be complete — reuses identification logic
- Feature 02 (Multi-Layer Pricing) must be complete — prices each product
- Feature 03 (Sustainability Scoring) must be complete — scores each product
- Feature 06 (Externality Pricing) must be complete — calculates hidden costs
- ~~Cloudinary object detection capabilities enabled~~ → **NOT AVAILABLE — use mock**
- This is a late-stage feature — build after core pipeline + receipt scanning

## Development Context — NO API CREDENTIALS

**You do not have API keys.** Build the full pipeline with mock data:

**Build with mock/real toggle:**
- Multi-product detection (Step 2): mock returns realistic bounding boxes + OCR for 8-10 products
- Batch identification (Step 3): mock returns product identifications for detected items

**Build fully (no API needed):**
- Shelf image capture UI (Step 1) — pure camera/React component
- Parallel scoring & pricing (Step 4) — orchestration using upstream feature mocks
- Overlay renderer (Step 5) — pure rendering logic (Canvas/CSS overlays on image)
- Product detail tap interaction (Step 6) — pure UI
- Sort toggle (Step 7) — pure UI
- Cache layer (Step 8) — pure code
- Progressive loading UX (Step 9) — pure UI state management

**Create `src/data/mock-shelf.ts`** with:
- Sample bounding box data for a grocery shelf (8-10 products with positions)
- Product identifications for each bounding box
- This allows the overlay renderer and interactions to be fully tested

**Testing with real APIs will happen in a separate session.**

## Build Order

### Step 1: Shelf Image Capture

Build the camera interface optimized for shelf-width photos.

- Implement a camera view with shelf-scanning guidance overlay
- Guide user to frame the shelf section horizontally
- Capture at high resolution (needed for product label legibility)
- Add "Tap to capture" button (V1 — static photo mode)
- V2 stretch: continuous camera feed with frame sampling
- Send captured image to Cloudinary for processing

### Step 2: Multi-Product Detection (Cloudinary)

Process shelf image to detect and isolate individual products.

- Implement `detectShelfProducts(imageUrl)` → array of detected products
- Use Cloudinary's object detection to identify individual product bounding boxes
- For each detected product:
  - Crop to bounding box region
  - Run OCR on the cropped region (brand name, product name)
  - Attempt barcode detection if visible
- Filter out non-products: shelf tags, price labels, dividers, empty space
- Deduplicate: if same product appears in multiple facings, merge to single entry
- Return:
  ```
  [{
    bounding_box: { x, y, width, height },
    cropped_image_url: string,
    ocr_text: string[],
    barcode: string | null,
    detection_confidence: number
  }]
  ```
- Limit: cap at 15 products per shelf scan (performance + cost control)

### Step 3: Batch Product Identification (Gemini)

Identify all detected products in a single batched Gemini call.

- Implement `identifyShelfProducts(detectedProducts)` → identified products
- Build a single Gemini prompt containing ALL detected products:
  "Identify each of the following products detected on a store shelf in Canada.
  For each, provide: product_name, brand, category."
- Include cropped images + OCR text for each product in the prompt
- Gemini returns array of identifications with confidence per product
- Cross-reference with Open Food Facts for any detected barcodes
- Batch approach: 1-2 Gemini calls vs 10-15 individual calls

### Step 4: Parallel Scoring & Pricing

Run the full analysis pipeline for all identified products simultaneously.

- For each identified product, trigger in parallel:
  - Sustainability scoring (Feature 03)
  - Pricing via all layers (Feature 02) — Layer 1 batched per banner
  - Externality cost calculation (Feature 06)
- Batch Gemini sustainability research: multiple products per prompt
- PC Express API: batch search queries where possible
- Results return progressively — update overlay as each product resolves

### Step 5: Overlay Renderer

Generate the annotated shelf image with score overlays.

- Implement `renderShelfOverlay(originalImage, productResults)` → annotated image
- For each product with results:
  - Draw color-coded border around bounding box:
    - Green (80-100), Yellow (60-79), Orange (40-59), Red (0-39)
  - Place score badge at top-right of bounding box
  - Border thickness: 3px, badge: rounded rectangle with score number
- Identify "Best on Shelf" — highest sustainability score
  - Add star badge + "Best on Shelf" banner to that product
- Render as a static annotated image (V1) overlaid on original photo
- Handle overlapping bounding boxes: offset badges to avoid collision

### Step 6: Product Detail Tap Interaction

Enable tapping individual products for full breakdown.

- Map touch coordinates to bounding box regions
- On tap → display full product card overlay:
  - Product name, brand, sustainability score with factor breakdown
  - Shelf price + gas cost + externality breakdown
  - Total true cost
  - "View alternatives" link → navigates to comparison view (Feature 04)
- Swipe or tap outside to dismiss card overlay
- Consider: slide-up bottom sheet for product detail

### Step 7: Sort Toggle on Overlay

Allow switching the overlay view between score, cost, and ratio.

- Add a small toggle bar at bottom of shelf overlay:
  [Score] [Price] [Ratio]
- Score mode (default): borders colored by sustainability score, badges show score
- Price mode: borders colored by out-of-pocket cost tier, badges show price
- Ratio mode: borders colored by Sweet Spot ratio tier, badges show stars
- Toggling re-renders overlay colors and badges — same bounding boxes

### Step 8: Shelf Scan Cache

Cache shelf scan results to avoid redundant API calls.

- Cache by individual product (not by shelf image — shelves vary, products don't)
- Cache key: `shelf:{product_id}:{user_postal_code}`
- TTL: 24 hours (aligned with flyer/price cycles)
- On repeat shelf scan: products already in cache load instantly, only new products hit APIs
- Display: cached results appear immediately, new results stream in progressively

### Step 9: Progressive Loading UX

Build the loading experience for shelf analysis.

- Phase 1 (< 2s): bounding boxes drawn around detected products (Cloudinary fast)
- Phase 2 (2-4s): product names appear in badges (Gemini identification)
- Phase 3 (4-10s): scores + colors populate per product as analysis completes
- Phase 4: "Best on Shelf" banner appears once all products are scored
- Skeleton state for unresolved products: gray border + spinning indicator
- Show: "Analyzing: 7/12 products scored"

## Key Files to Create

```
src/services/shelf/imageCapture.ts       — camera + capture UI
src/services/shelf/multiDetection.ts     — Cloudinary multi-product detection
src/services/shelf/batchIdentify.ts      — Gemini batch identification
src/services/shelf/parallelAnalysis.ts   — parallel scoring/pricing/externality
src/services/shelf/overlayRenderer.ts    — annotated image generation
src/services/shelf/shelfCache.ts         — per-product cache
src/components/ShelfScanner.tsx          — camera + capture interface
src/components/ShelfOverlay.tsx          — annotated result view
src/components/ShelfProductDetail.tsx    — tap-to-expand product card
src/types/shelf.ts                       — shared type definitions
```

## Testing Approach

- Test multi-product detection with real shelf photos (grocery, personal care, cleaning)
- Verify bounding box accuracy: > 85% of visible products correctly bounded
- Test batch identification: all products in 1-2 Gemini calls, not 10+
- Test overlay rendering: borders don't overlap, badges are legible
- Test progressive loading: products appear as they resolve, not all at once
- Test tap interaction: correct product detail opens on tap
- Performance: full shelf of 10 products analyzed in < 10 seconds
- Test cache: second scan of same shelf section loads instantly

## Definition of Done

- User captures shelf photo → products detected and outlined within 2 seconds
- All visible products identified, scored, and color-coded within 10 seconds
- "Best on Shelf" banner highlights top product
- Tapping any product shows full sustainability + pricing breakdown
- Sort toggle switches overlay between score, price, and ratio views
- Cached products load instantly on repeat scans
- Progressive loading provides continuous feedback during analysis
