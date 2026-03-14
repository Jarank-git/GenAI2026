# Feature Design: AR Shelf Scanner

## Overview

User points their phone at a store shelf. The app identifies multiple products simultaneously,
overlays color-coded sustainability scores, and highlights the best option. Scan the whole
shelf instead of one product at a time.

## Problem Statement

Single-product scanning is tedious. In a store aisle with 15 pasta brands, scanning each one
individually takes minutes. The real power is seeing the entire shelf at once — instant visual
comparison without touching anything.

## Core Pitch

"Don't scan one product. Scan the whole shelf. See everything at once. Shop with your eyes open."

## User Flow

### V1 — Static Photo Mode (Hackathon MVP)

```
User taps "Shelf Scan" → Camera opens
  → Captures photo of shelf section
  → Processing screen: "Analyzing shelf..."
    → Products detected and outlined (fast, Cloudinary)
    → Scores populate per product (async, as Gemini + pricing resolve)
  → Annotated image displayed with overlays
    → Tap any product for full breakdown
    → "Best on this shelf" banner auto-highlights top scorer
```

### V2 — Live AR Mode (Stretch Goal)

```
Camera stays active → products detected in real-time
  → Overlays update as products enter/leave frame
  → Scores cached — moving camera doesn't re-trigger API calls
```

## Technical Pipeline

### Step 1: Image Capture & Processing (Cloudinary)

- Image enhancement: normalize store lighting, reduce glare
- Object detection: isolate individual products on the shelf
  - Bounding boxes around each distinct product
  - Handle overlapping/tightly packed items
- OCR per product: extract brand name, product name from labels
- Barcode detection: read any visible barcodes

### Step 2: Product Identification (Gemini)

- Each detected product sent to Gemini for identification
- Batch call preferred: send all detected products in one prompt to minimize API calls
- Cross-reference with Open Food Facts for barcode matches
- Output: identified product list with confidence scores

### Step 3: Pricing & Scoring (Parallel)

- All identified products run through pricing layers simultaneously
- All products scored via Sustainability Scoring Algorithm in parallel
- Externality costs calculated per product

### Step 4: Overlay Generation

- Results mapped back to bounding box positions from Step 1
- Color-coded borders rendered around each product
- Score badges positioned at product location

## Color Coding & Interaction

| Score Range | Border Color |
|-------------|-------------|
| 80-100 | Green |
| 60-79 | Yellow |
| 40-59 | Orange |
| 0-39 | Red |

- **Passive view**: color-coded borders + score badges at a glance
- **Tap a product**: full card with breakdown, pricing, alternatives
- **"Best on Shelf" banner**: auto-highlights top scorer
- **Sort toggle**: switch overlay between score, cost, or ratio
- **Snapshot mode**: freeze frame, save, share

## Performance Design

### API Cost Per Shelf Scan

- 10 products detected → 10 Layer 1 calls + up to 10 Layer 2 grounded searches
- Grounded search cost: ~$0.14 per full shelf scan (10 products)
- Gemini sustainability: batch call reduces to 1-2 API calls for all products

### Loading Strategy

1. **Instant**: product bounding boxes shown (Cloudinary, < 2s)
2. **Fast**: product names identified (Gemini batch, 2-4s)
3. **Progressive**: scores + colors populate per product as they resolve (3-8s)
4. **Complete**: all scores loaded, "Best on Shelf" banner appears

### Caching

- Cache results by product for 24 hours (aligned with flyer cycles)
- If user scans the same shelf section again, serve cached scores instantly
- Cache key: `{product_id}:{user_location}` (hyperlocal adjustments are user-specific)

## Edge Cases

- **Partially visible products**: skip items where < 50% of label is visible
- **Shelf tags vs products**: filter out price tags, shelf labels, dividers
- **Glare/reflective packaging**: Cloudinary image enhancement handles most cases
- **Very crowded shelf**: limit to top 10-15 most clearly visible products
- **Products not in database**: show gray border with "?" badge, offer manual identification
- **Same product multiple facings**: deduplicate — show one score for repeated products

## V1 vs V2 Scope

| Capability | V1 (MVP) | V2 (Stretch) |
|-----------|----------|-------------|
| Input | Single photo | Live camera feed |
| Output | Annotated static image | Real-time overlay |
| Update | One-time render | Continuous as frame changes |
| Performance | 5-10s total | Real-time with caching |
| Complexity | Achievable in hackathon | Requires AR framework |

## Dependencies

- Cloudinary (image processing, object detection, bounding boxes)
- Gemini API (product identification, sustainability research — batched)
- Multi-Layer Pricing Architecture (per-product pricing)
- Sustainability Scoring Algorithm (per-product scoring)
- True Cost Externality Pricing (per-product externalities)

## Success Metrics

- Product detection accuracy: > 85% of visible products correctly identified
- Full shelf render time: < 10 seconds for 10 products (V1)
- User engagement: > 50% of users who try shelf scan use it again within a week
- "Best on Shelf" accuracy: user agrees with recommendation > 70% of the time

## Open Questions

- Should V1 allow multiple photos to stitch together a wider shelf view?
- How to handle products the user has already purchased (from receipt history)?
- Should shelf scan results persist as a "shelf report" the user can reference later?
- Is there value in a "compare two shelves" mode (e.g., same category at different stores)?
