# Feature Design: Sustainability Scoring Algorithm

## Overview

A category-agnostic scoring system (0-100) that evaluates products across environmental,
ethical, and lifecycle dimensions. Scoring weights shift by product category to reflect
what matters most for that type of product.

## Development Context — READ FIRST

> **You do NOT have API keys or credentials.** Build the full scoring engine — category weights,
> factor scoring, hyperlocal adjustments, score interpretation — with **mock/stub API responses**.
> Gemini sustainability research and Open Food Facts lookups should return realistic mock data
> so the scoring math and UI can be fully exercised without credentials.
>
> **Your job**: build the complete scoring pipeline so that enabling real APIs requires only
> setting environment variables — no structural code changes.
>
> **Testing with real APIs will happen in a separate session** after credentials are configured.

## Problem Statement

Existing sustainability apps give static, generic scores that don't account for product
category differences. Labor practices matter more for clothing than pasta. Packaging matters
more for beverages than electronics. A universal fixed-weight system produces misleading
comparisons.

## Scoring Architecture

### Base Score Calculation (0-100)

| Factor | Default Weight | Source |
|--------|---------------|--------|
| Transport distance (origin → store → user) | 25% | Google Maps API + Gemini research |
| Packaging (type, recyclability, local processing) | 20% | Cloudinary image analysis + Gemini |
| Certifications (organic, fair trade, B Corp, etc.) | 20% | Open Food Facts + Gemini research |
| Brand ethics & labor transparency | 15% | Gemini research |
| Production method & resource intensity | 10% | Gemini research |
| End-of-life / local recyclability | 10% | Gemini + ECCC data + hyperlocal context |

### Category Weight Overrides

Weights adjust per category to reflect what's materially important:

| Category | Transport | Packaging | Certs | Brand/Labor | Production | End-of-Life |
|----------|-----------|-----------|-------|-------------|------------|-------------|
| Food/Beverage | 25% | 20% | 20% | 15% | 10% | 10% |
| Cleaning Products | 15% | 25% | 15% | 10% | 25% | 10% |
| Personal Care | 15% | 20% | 20% | 15% | 20% | 10% |
| Clothing | 15% | 5% | 15% | 30% | 25% | 10% |
| Electronics | 10% | 10% | 10% | 15% | 25% | 30% |
| Home Goods | 20% | 15% | 10% | 15% | 20% | 20% |

### Gemini Prompt Strategy

Gemini receives the identified product and returns structured sustainability data:

```
For [Product Name] by [Brand]:
1. Country/region of origin and primary transport route to Canada
2. Packaging materials and weight (plastic type, cardboard, glass, etc.)
3. Certifications held (organic, fair trade, B Corp, Rainforest Alliance, etc.)
4. Known brand practices (labor, environmental commitments, controversies)
5. Production method (conventional, organic, intensive, artisanal)
6. End-of-life: recyclability of each packaging component
```

Each factor scored individually (0-100), then weighted by category to produce final score.

### Hyperlocal Adjustments (Post-Base)

After base score calculation, multipliers from the Hyperlocal Context Engine apply:

- **Water-intensive product + drought region** → water factor penalty (up to -15 pts)
- **Non-recyclable packaging locally** → packaging/end-of-life score drops to near-zero
- **Out-of-season produce** → transport/energy penalty (up to -20 pts)
- **High-carbon grid + electric manufacturing** → production penalty (up to -10 pts)

Adjustments are additive penalties applied to the weighted base score, clamped to [0, 100].

## Score Interpretation

| Range | Label | Color |
|-------|-------|-------|
| 80-100 | Excellent | Green |
| 60-79 | Good | Yellow-Green |
| 40-59 | Average | Yellow |
| 20-39 | Poor | Orange |
| 0-19 | Very Poor | Red |

## Cross-Category Comparisons

Scores are ONLY comparable within the same product category. The app never suggests
a cleaning product as an "alternative" to pasta. Category is determined during product
identification and locked before scoring begins.

## Data Flow

```
Product identified (category locked)
  → Gemini researches sustainability factors
  → Open Food Facts checked for existing eco-scores/certifications
  → Each factor scored 0-100
  → Category weights applied
  → Base score calculated
  → Hyperlocal adjustments applied
  → Final adjusted score returned
```

## Edge Cases

- **No sustainability data available**: Gemini flags uncertainty; score shows as "Insufficient Data"
  with whatever partial score is calculable
- **Brand-new product**: Gemini researches brand-level practices as proxy
- **White-label/store brand**: score based on available supply chain info; lower confidence shown
- **Multi-material packaging**: each component scored separately, weighted by mass proportion

## Dependencies

- Gemini API (sustainability research, factor scoring)
- Open Food Facts API (existing eco-scores, certifications, ingredients)
- Cloudinary (packaging analysis from product image)
- Hyperlocal Context Engine (adjustment multipliers)
- Google Maps API (transport distance calculation)

## Success Metrics

- Score consistency: same product scanned 5 times should yield scores within ±3 points
- Factor completeness: > 80% of products have all 6 factors scored (not marked "insufficient")
- User trust: > 70% of users in testing agree scores "feel right" for known good/bad products

## Open Questions

- Should Gemini scores be calibrated against Open Food Facts eco-scores where available?
- How to handle score drift over time as Gemini's training data evolves?
- Should users see the individual factor breakdown by default, or only on drill-down?
- How to weight "no data" — is missing certification data neutral or slightly negative?
