# Implementation Plan: Four Sorting Modes

> Design doc: `docs/design/04-sorting-modes.md`

## Prerequisites

- Feature 02 (Multi-Layer Pricing) must be complete — provides shelf prices + gas costs
- Feature 03 (Sustainability Scoring) must be complete — provides sustainability scores
- Feature 06 (Externality Pricing) must be complete — provides externality costs
- Feature 05 (Hyperlocal Context Engine) must be complete — provides vehicle profile for gas cost

## Build Order

### Step 1: Alternative Product Data Model

Define the unified data structure that holds all sortable dimensions for each alternative.

- Create type: `AlternativeProduct` containing all four sort dimensions:
  - `sustainability_score: number` (0-100, from Feature 03)
  - `shelf_price: number` (CAD, from Feature 02)
  - `gas_cost: number` (CAD, from Feature 02)
  - `out_of_pocket: number` (shelf_price + gas_cost)
  - `externality_cost: number` (CAD, from Feature 06)
  - `total_cost: number` (out_of_pocket + externality_cost)
  - `ratio: number` (sustainability_score / total_cost)
  - Plus: product identity, store info, confidence tags
- All four dimensions computed ONCE upfront when alternatives are loaded
- This single data structure serves all four sort modes without re-fetching

### Step 2: Sort Functions

Implement the four sort algorithms as pure functions.

- `sortByGreen(alternatives)` → sort by sustainability_score descending
- `sortByBudget(alternatives)` → sort by out_of_pocket ascending
- `sortBySweetSpot(alternatives)` → sort by ratio descending
- `sortByPlanetPick(alternatives)` → sort by externality_cost ascending
- Tie-breaking: all modes use sustainability_score descending as secondary sort
- Handle missing data: products missing price excluded from Budget/Sweet Spot;
  products missing externality excluded from Planet Pick; missing items get
  pushed to end of list with "data unavailable" flag

### Step 3: Ratio Stars Calculator

Convert the Sweet Spot ratio to a 5-star visual rating.

- Implement `calculateRatioStars(alternatives)` → returns star rating per product
- Stars are RELATIVE to the current result set (not absolute)
- Sort all ratios, divide into quintiles:
  - Top 20% → 5 stars, next 20% → 4 stars, etc.
- If fewer than 5 alternatives, scale proportionally
- Return star count alongside ratio value for each product

### Step 4: Sort Bar UI Component

Build the persistent sort mode selector.

- Create a horizontal tab bar with four mode buttons:
  Green, Budget, Sweet Spot, Planet Pick
- Sweet Spot is the default active mode on first load
- Tapping a mode re-sorts the alternatives list instantly (client-side only)
- Active mode visually highlighted (filled background + bold text)
- Add subtle animation on sort transition (list items reorder with motion)

### Step 5: Alternative Product Card Component

Build the product card that adapts display to the active sort mode.

- Each card shows primary + secondary data based on active mode:
  - Green: score (large) + out-of-pocket (small)
  - Budget: out-of-pocket (large) + score (small)
  - Sweet Spot: ratio stars (large) + score + total cost (small)
  - Planet Pick: externality cost (large) + score (small)
- Include: product name, brand, store name, distance, confidence tag
- Tap card → navigate to full product breakdown view
- Handle "data unavailable" state gracefully (grayed card, explanation text)

### Step 6: Comparison View Assembly

Wire the sort bar + card list into the main comparison screen.

- Receives: scanned product data + array of alternative products (all dimensions computed)
- Top section: scanned product card (fixed, shows user's original scan)
- Sort bar (Step 4) — sticky below scanned product card
- Scrollable list of alternative product cards (Step 5) — sorted by active mode
- Mode switch triggers client-side re-sort + re-render with animation
- No loading states on mode switch — all data is already present

### Step 7: Scanned Product Comparison

Show the scanned product's metrics alongside alternatives for direct comparison.

- Display the scanned product in a distinct "Your Product" card at the top
- Show all four dimensions so user can compare against any alternative
- Optionally allow the scanned product to appear inline in the sorted list
  (with visual distinction) so users see where their product ranks

## Key Files to Create

```
src/types/alternatives.ts              — AlternativeProduct type definition
src/utils/sorting.ts                   — four sort functions + tie-breaking
src/utils/ratioStars.ts                — quintile-based star calculator
src/components/SortBar.tsx             — mode selector tab bar
src/components/AlternativeCard.tsx     — mode-adaptive product card
src/components/ComparisonView.tsx      — assembled comparison screen
src/components/ScannedProductCard.tsx  — "Your Product" header card
```

## Testing Approach

- Unit test each sort function with known data: verify correct ordering
- Test tie-breaking: equal scores → secondary sort by sustainability_score
- Test missing data handling: products with null price/externality excluded from relevant modes
- Test ratio stars: verify quintile distribution with various result set sizes
- Test card display: each mode shows the correct primary/secondary data
- UI test: mode switch re-sorts list without delay or API call
- Integration test: product scan → pricing + scoring + externality → comparison view renders

## Definition of Done

- All four sort modes produce correct ordering
- Sweet Spot is the default mode
- Mode switching is instant (< 200ms, client-side only)
- Cards adapt their display to the active sort mode
- Missing data handled gracefully (excluded from relevant modes, not hidden entirely)
- Scanned product shown for direct comparison against alternatives
- Ratio stars calculated relative to current result set
