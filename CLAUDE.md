# EcoLens

Canadian-focused sustainability scoring app. Scan a product, get alternatives ranked by sustainability, price, and environmental impact — personalized to your location, vehicle, and local infrastructure.

## Project Status

Design phase. No code yet. Full design doc: `hackathon-plan.md`

## Core Flow

Scan product → identify via Cloudinary → fetch live prices → Gemini researches sustainability → Google Maps calculates distance/gas cost → return ranked alternatives with 4 sort modes.

## Architecture

### Pricing Layers (anti-hallucination)

Gemini NEVER guesses prices. All prices come from real sources:

- **Layer 1 — PC Express API** (`POST api.pcexpress.ca/product-facade/v3/products/search`): structured JSON with real prices for all Loblaw banners (Loblaws, No Frills, RCSS, Shoppers). Requires `X-Apikey` + `Site-Banner` headers.
- **Layer 2 — Gemini + Google Search Grounding**: for non-Loblaw stores (Walmart, Metro, Sobeys). Gemini searches Google for indexed flyer deals from Flipp.com, RedFlagDeals, retailer pages. ~$14/1k queries.
- **Layer 3 — Gemini URL Context**: supplementary, pass known product URLs directly. Unreliable for JS-heavy SPAs. Fallback to Layer 2.
- Confidence indicators: `✓ Verified` (Layer 1) | `~ Web estimate` (Layer 2) | `— Unavailable`

### Image Processing — Cloudinary

All image work goes through Cloudinary:
- Product photo enhancement, OCR, barcode detection
- Receipt scanning (OCR → line items + prices)
- AR shelf scanner (object detection → isolate products)
- Overlay image generation

### Location — Google Maps Platform

- **Distance Matrix API**: driving distance to stores
- **Places API**: nearby store discovery
- **Geocoding API**: postal code → coordinates
- Gas cost formula: `(km × vehicle L/100km / 100) × gas price per litre`

### Intelligence — Gemini API

Gemini handles research/reasoning only (not pricing):
- Product identification from Cloudinary image data
- Sustainability research (sourcing, packaging, certifications, labor)
- Alternative discovery in same category
- Score calculation from real pricing data + sustainability research
- Category detection for weight adjustment
- Gas price lookup via Google Search Grounding or NRCan baseline

## Cost Terminology

Three distinct cost figures — never mix these:
- **Out-of-Pocket** = shelf price + gas to store
- **Externality** = monetized environmental damage (carbon, water, packaging)
- **Total Cost** = out-of-pocket + externality

## Four Sorting Modes

1. **Green**: sustainability score descending
2. **Budget**: out-of-pocket cost ascending
3. **Sweet Spot** (default): sustainability score / total cost descending
4. **Planet Pick**: externality cost ascending

## Sustainability Score (0-100)

| Factor | Weight | Source |
|--------|--------|--------|
| Transport distance | 25% | Google Maps + Gemini |
| Packaging & recyclability | 20% | Cloudinary + Gemini |
| Certifications | 20% | Open Food Facts + Gemini |
| Brand ethics & labor | 15% | Gemini |
| Production method | 10% | Gemini |
| End-of-life recyclability | 10% | Gemini + ECCC + local context |

Hyperlocal multipliers applied after base score: water stress, local recycling capability, seasonal penalties, provincial grid carbon intensity.

## Hyperlocal Context Engine

Scores adjust per-user based on:
- **Vehicle**: NRCan fuel consumption ratings (L/100km by make/model/year)
- **Provincial grid**: ECCC emission intensity factors (gCO2eq/kWh by province)
- **Water stress**: ECCC hydrometric data + WRI Aqueduct atlas
- **Municipal recycling**: Gemini researches local programs; ReCollect platform cross-ref
- **Season**: location + date determines what's locally in-season

## Extended Features

1. **Receipt Scanning**: photograph receipt → Cloudinary OCR → Gemini fuzzy-matches items → sustainability receipt with optimized swap suggestions. Progressive loading, 15-30s for full receipt.
2. **True Cost Externality Pricing**: carbon (~$110/tonne via Canada's federal price), water, packaging, land use, eutrophication. Shows hidden $ cost alongside shelf price.
3. **AR Shelf Scanner**: photograph shelf → Cloudinary object detection → identify all products → overlay color-coded scores. MVP: annotated photo (not live AR). ~$0.14 per shelf scan in grounded search costs. 24-hour cache.

## Canadian Data Sources (All Free)

| Source | Data | Access |
|--------|------|--------|
| Open Food Facts | Products, eco-scores, ingredients | REST API (JSON) |
| ECCC Grid Intensity | Provincial gCO2eq/kWh | CSV, open.canada.ca |
| HFED | Real-time generation mix by province | JSON API, energy-information.canada.ca |
| ECCC Hydrometric | Water levels, 2,100+ stations | OGC API, api.weather.gc.ca |
| WRI Aqueduct | Water stress indices | GIS shapefiles |
| NRCan Fuel Ratings | Vehicle L/100km, 1995-2026 | CSV, open.canada.ca |
| NRCan Gas Prices | Monthly ¢/litre, 11 cities | CSV via CKAN API |
| Ontario Gas Report | Weekly, 10 markets | CSV, data.ontario.ca |
| StatsCan WDS | Waste, energy, GHG tables | REST API (JSON/SDMX) |
| ECCC AQHI | Real-time air quality | OGC API, api.weather.gc.ca |
| NPRI | Facility pollutant releases | CSV/XLSX, open.canada.ca |
| Federal Carbon Price | ~$110/tonne (2026) → $170 by 2030 | Policy reference |

## Key Design Decisions

- Canadian market only. Metric units (km, L/100km, ¢/litre). Postal codes. CAD.
- Category agnostic (grocery, cleaning, personal care, clothing, electronics). Grocery uses Layer 1 + 2. Non-grocery uses Layer 2 only (Google Shopping is stronger for retail).
- Scoring weights shift by category (labor heavier for clothing, packaging heavier for beverages).
- All prices must have a verifiable source. Missing = "Price unavailable", never fabricated.
- Cache: 24h for Layer 1, 48h for Layer 2, aligned with weekly flyer cycles.

## Open Questions

- PC Express API stability (unofficial — keys may rotate)
- Non-Loblaw coverage gaps with Layer 2
- Onboarding friction vs personalization depth
- Gamification (carbon wallet) and social features — MVP or defer?
