# Feature Design: Product Scanning & Identification

## Overview

The foundational entry point for EcoLens. User photographs a product; the system identifies it
and kicks off the full analysis pipeline (pricing, sustainability, alternatives).

## Problem Statement

Users need a frictionless way to input products. Typing product names is slow and error-prone.
Barcode-only scanning excludes unpackaged goods. The system must handle diverse input quality —
blurry photos, partial labels, angled shots, store lighting.

## User Flow

1. User opens camera via app
2. Captures photo of product (label, barcode, or full package)
3. Loading state: "Identifying product..."
4. Product identified → confirmation screen: "Is this [Product Name]?"
5. User confirms → pipeline triggers (pricing + sustainability + alternatives)
6. Results rendered in the comparison view

## Technical Design

### Image Processing Pipeline (Cloudinary)

- **Image enhancement**: auto-brightness, contrast normalization, noise reduction
- **Barcode detection**: UPC/EAN extraction when visible — fastest identification path
- **OCR on labels**: extract brand name, product name, weight/volume, ingredients if visible
- **Object detection**: isolate the product from background clutter (shelf, hand, counter)
- Output: structured data package → `{ barcode?, brand_text?, product_text?, ocr_raw? }`

### Product Identification (Gemini API)

- Receives Cloudinary's structured output
- Cross-references against Open Food Facts API for barcode matches
- If no barcode: uses brand + product text + visual cues to identify
- Returns: `{ product_name, brand, category, weight, confidence_score }`
- Confidence threshold: >= 0.8 → auto-proceed; < 0.8 → ask user to confirm/correct

### Disambiguation Flow

When confidence is low or multiple matches exist:
- Present top 3 candidates with product images (from Open Food Facts or web)
- User taps the correct one
- Selected match feeds into the pricing/sustainability pipeline

## Data Contracts

### Cloudinary → Gemini Input

```
{
  image_url: string,        // Cloudinary-hosted processed image
  barcode: string | null,   // UPC/EAN if detected
  ocr_text: string[],       // All text extracted from label
  brand_detected: string | null,
  confidence: number        // Cloudinary's detection confidence
}
```

### Gemini → Pipeline Output

```
{
  product_id: string,       // Internal ID or Open Food Facts ID
  product_name: string,
  brand: string,
  category: string,         // e.g., "pasta", "cleaning_spray", "t-shirt"
  weight_volume: string,    // e.g., "500g", "750ml"
  confidence: number,
  open_food_facts_match: boolean
}
```

## Edge Cases

- **No barcode visible**: rely on OCR + Gemini visual identification
- **Store brand shorthand**: Gemini maps abbreviations (e.g., "PC" → President's Choice)
- **Damaged/partial label**: Gemini infers from partial text + package shape/color
- **Non-food products**: no Open Food Facts match — Gemini handles identification solo
- **Multiple products in frame**: isolate the most prominent/centered item; suggest AR mode for shelf

## Performance Targets

- Cloudinary processing: < 2 seconds
- Gemini identification: < 3 seconds
- Total scan-to-confirmation: < 5 seconds

## Dependencies

- Cloudinary (image processing, OCR, barcode detection)
- Gemini API (product identification, category detection)
- Open Food Facts API (barcode lookup, product database)

## Success Metrics

- Identification accuracy: > 90% on first attempt (no disambiguation needed)
- Scan-to-confirmation time: < 5 seconds p95
- User correction rate: < 15% of scans require manual disambiguation

## Open Questions

- Should we support gallery upload (existing photo) in addition to live camera?
- How to handle products not in any database (truly unknown items)?
- Should identification results be cached per barcode to skip Gemini on repeat scans?
