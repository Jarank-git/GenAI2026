# Feature Design: Four Sorting Modes

## Overview

The core interaction layer. Once alternatives are loaded, users switch between four distinct
ranking perspectives. Each mode answers a different user question and uses a different
calculation to sort results.

## Development Context — READ FIRST

> **You do NOT have API keys or credentials.** This feature is mostly client-side sorting logic
> and UI — it does not call external APIs directly. Build it using **mock alternative product
> data** (realistic scores, prices, externalities) so all four sort modes and the UI can be
> fully tested. The mock data should come from upstream features (01-03, 06) which will also
> use mocks.
>
> **Your job**: build the complete sorting + comparison UI so it works end-to-end with mock data
> and requires zero changes when real API data flows through.
>
> **Testing with real APIs will happen in a separate session** after credentials are configured.

## Problem Statement

Users have different priorities. Some want the greenest product regardless of cost. Others
need the cheapest option. Most want a balance. No single ranking satisfies everyone.
Competing apps offer only one perspective — a sustainability score with no price context.

## The Four Modes

### Mode 1: Best Sustainability (Green)

- **Sort key**: adjusted sustainability score, descending
- **User question**: "What's the greenest option, period?"
- **Calculation**: uses the final adjusted score from the Sustainability Scoring Algorithm
  (base score + hyperlocal adjustments)
- **Ignores**: all pricing — shelf price, gas cost, externalities
- **Use case**: eco-conscious user with flexible budget

### Mode 2: Best Price (Budget)

- **Sort key**: out-of-pocket cost in CAD, ascending
- **User question**: "What's cheapest when I factor in the drive?"
- **Calculation**: `out_of_pocket = shelf_price + gas_cost_to_store`
- **Gas cost formula**:
  `(driving_distance_km × vehicle_L_per_100km / 100) × local_gas_price_per_litre`
- **Data sources**: shelf price from pricing layers; distance from Google Maps Distance Matrix;
  vehicle consumption from NRCan; gas prices from NRCan or Gemini lookup
- **Ignores**: sustainability score, externality costs
- **Use case**: budget-constrained shopper

### Mode 3: Best Sustainability-to-Price Ratio (Sweet Spot) — DEFAULT

- **Sort key**: ratio value, descending
- **User question**: "What's the best I can do without overpaying?"
- **Calculation**: `ratio = sustainability_score / total_cost`
- **Total cost**: `shelf_price + gas_cost + externality_cost`
- **Why this is default**: answers the question most real users actually have — balances
  eco-friendliness with affordability
- **Example**:
  - Product A: score 85, total cost $4.12 → ratio 20.6
  - Product B: score 60, total cost $2.33 → ratio 25.8
  - Product B ranks higher — better value even though A is greener

### Mode 4: Lowest Externality Cost (Planet Pick)

- **Sort key**: externality cost in CAD, ascending
- **User question**: "Which product does the least environmental damage in dollar terms?"
- **Calculation**: uses monetized externality values from True Cost Externality Pricing
- **Different from Mode 1**: Mode 1 uses the holistic sustainability score (certifications,
  brand ethics, etc.). Mode 4 uses only the monetized environmental damage.
  A product can score well on sustainability (good certs, ethical brand) but still have
  high externalities (heavy packaging, long transport). This mode catches that.
- **Use case**: user focused on real-world environmental impact, not brand reputation

## UI Design

### Sort Bar

Persistent horizontal bar below the scanned product card, above the alternatives list:

```
[🌿 Green] [💰 Budget] [⚖️ Sweet Spot] [🌍 Planet Pick]
```

- Active mode highlighted with filled background
- Tap to switch — list re-sorts with animation
- Sweet Spot selected by default on first load

### Alternative Card Layout

Each alternative displays data relevant to the active sort mode:

| Mode | Primary display | Secondary display |
|------|----------------|-------------------|
| Green | Sustainability score (large) | Out-of-pocket cost (small) |
| Budget | Out-of-pocket cost (large) | Sustainability score (small) |
| Sweet Spot | Ratio stars (large) | Score + total cost (small) |
| Planet Pick | Externality cost (large) | Sustainability score (small) |

### Ratio Stars (Sweet Spot Mode)

Convert ratio to a 5-star visual:
- Top 20% of results in the set → 5 stars
- Next 20% → 4 stars
- Next 20% → 3 stars
- Next 20% → 2 stars
- Bottom 20% → 1 star

Relative within the current result set, not absolute.

## Data Requirements Per Mode

| Data Point | Green | Budget | Sweet Spot | Planet Pick |
|------------|-------|--------|------------|-------------|
| Sustainability score | ✓ | | ✓ | |
| Shelf price | | ✓ | ✓ | |
| Gas cost to store | | ✓ | ✓ | |
| Externality cost | | | ✓ | ✓ |
| Vehicle profile | | ✓ | ✓ | |
| Distance to store | | ✓ | ✓ | |

## Sorting Logic

All alternatives for the scanned product are fetched once. Switching modes re-sorts the
existing data client-side — no additional API calls. This means all four data dimensions
(score, shelf price, gas cost, externality cost) must be computed upfront for every alternative.

## Edge Cases

- **Missing price**: product excluded from Budget and Sweet Spot modes; shown in Green
  and Planet Pick with "price unavailable" note
- **Missing externality data**: excluded from Planet Pick; shown in other modes with note
- **Tie-breaking**: when sort values are equal, secondary sort by sustainability score desc
- **Single alternative**: still show all four modes; useful for comparing against the
  scanned product itself
- **Zero gas cost** (transit/bike user): Budget mode effectively becomes shelf-price-only sort

## Dependencies

- Sustainability Scoring Algorithm (Mode 1, 3)
- Multi-Layer Pricing Architecture (Mode 2, 3, 4)
- True Cost Externality Pricing (Mode 3, 4)
- Hyperlocal Context Engine — Vehicle Profile (Mode 2, 3)
- Google Maps Distance Matrix API (Mode 2, 3)

## Success Metrics

- Mode switch time: < 200ms (client-side re-sort)
- Default mode (Sweet Spot) engagement: > 50% of users keep it as default after first use
- Mode exploration: > 60% of users try at least 2 modes per session

## Open Questions

- Should modes be reorderable by the user (custom tab order)?
- Should the scanned product itself appear in the sorted list for direct comparison?
- Do we need a "Custom" mode where users set their own weight sliders?
