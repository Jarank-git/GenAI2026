# Implementation Plan: True Cost Externality Pricing

> Design doc: `docs/design/06-externality-pricing.md`

## Current Status: REAL API INTEGRATION PHASE
- Scaffolding: COMPLETE — all 5 externality calculators, config constants, and pipeline are built
- Carbon, water, packaging, land use, eutrophication calculators: Pure math, fully functional
- Lifecycle research: MOCK ONLY — looks up mock-lifecycle.ts, has TODO for real Gemini API call
- Externality pricing constants: Real Canadian data (carbon price schedule 2025-2030, water costs, plastic costs by type)
- **Goal: Get real lifecycle data from Gemini API — when we calculate externality costs, the underlying carbon/water/packaging quantities should come from real Gemini research, not hardcoded mock data**

## Prerequisites

- Feature 05 (Hyperlocal Context Engine) must be complete — provides regional adjustments
- Feature 01 (Product Scanning) must be complete — provides product identity
- Gemini API key configured in `.env.local`
- ECCC carbon pricing reference data — **publicly available, embed as config**

## Development Context

API keys are configured in `.env.local`. Services should use real APIs and only fall back to mock data when keys are missing.

## Files That Need Real API Verification

- `src/services/externality/lifecycle.ts` — PRIORITY: implement real Gemini API call for lifecycle data (carbon_kg_co2e, water_litres, packaging materials, land_use_m2, eutrophication_index)
- `src/services/externality/carbon.ts` — pure math, works
- `src/services/externality/water.ts` — pure math, works
- `src/services/externality/packaging.ts` — pure math, works
- `src/services/externality/land-use.ts` — pure math, works
- `src/config/externality-pricing.ts` — real constants, works
- `src/orchestrators/externality-pipeline.ts` — verify pipeline works end-to-end with real lifecycle data

## Build Order

### Step 1: Externality Constants & Pricing Config

Define the reference pricing data used to monetize environmental damage.

- Create config file with pricing constants:
  - `carbon_price_per_tonne`: $110 CAD (2026), with annual schedule to $170 by 2030
  - `water_base_cost_per_litre`: base cost before scarcity multiplier
  - `plastic_cost_per_kg`: by plastic type (#1 PET, #2 HDPE, #5 PP, etc.)
  - `land_use_cost_per_m2`: by commodity (beef, palm oil, soy, cotton, etc.)
  - `eutrophication_cost_index`: indexed cost per unit of fertilizer runoff
- Source these from published academic studies and Canadian government references
- Make all constants configurable — prices change annually

### Step 2: Gemini Lifecycle Research Prompt

Build the prompt that extracts physical environmental quantities from Gemini.

- Implement `researchLifecycle(product)` → returns quantified externalities
- Prompt Gemini to analyze the product's full lifecycle:
  "For [product] by [brand], estimate the environmental impact per unit sold in Canada:
   1. Carbon: total kg CO2e across lifecycle (production, transport, packaging, disposal)
   2. Water: total litres consumed in production
   3. Plastic: grams of packaging by type (PET, HDPE, PP, etc.)
   4. Land use: m² of land-use-change attributable (for agricultural products)
   5. Eutrophication: fertilizer/chemical runoff index (0-10 scale)"
- Enforce JSON response schema via Gemini's structured output mode
- Validate ranges: reject obviously wrong values (e.g., negative quantities, 1000 kg CO2 for pasta)

### Step 3: Carbon Cost Calculator

Monetize carbon emissions using Canada's federal carbon price.

- Implement `calculateCarbonCost(kg_CO2e)` → CAD amount
- Formula: `kg_CO2e × (carbon_price_per_tonne / 1000)`
- Use the year-appropriate carbon price from config (2026: $110/tonne)
- Split into sub-categories for display: production carbon, transport carbon, disposal carbon
- Return: `{ total_carbon_cost, breakdown: { production, transport, disposal } }`

### Step 4: Water Cost Calculator

Monetize water consumption with regional scarcity adjustment.

- Implement `calculateWaterCost(litres, waterStressIndex)` → CAD amount
- Formula: `litres × base_water_cost × scarcity_multiplier`
- Scarcity multiplier from Hyperlocal Engine (Feature 05):
  - LOW stress: 1.0x, MEDIUM: 1.5x, HIGH: 2.5x, VERY HIGH: 4.0x
- Return: `{ water_cost, scarcity_multiplier, stress_level }`

### Step 5: Packaging Cost Calculator

Monetize plastic/packaging waste with local recycling context.

- Implement `calculatePackagingCost(packaging, recyclingCapabilities)` → CAD amount
- For each packaging component:
  - Look up cost per gram by material type from config
  - Check if material is recyclable locally (from Hyperlocal Engine)
  - If NOT recyclable locally: apply landfill cost multiplier (2x-3x base cost)
- Return: `{ packaging_cost, breakdown: [{ material, grams, cost, recyclable_locally }] }`

### Step 6: Land Use & Eutrophication Calculators

Monetize land use change and fertilizer runoff costs.

- `calculateLandUseCost(m2, commodity)` → CAD amount
  - Use commodity-specific deforestation cost per m² from config
  - Only applies to products with significant land-use-change footprint
    (beef, palm oil, soy, coffee, cocoa, cotton)
  - Products with no land-use-change link: cost = $0
- `calculateEutrophicationCost(runoffIndex)` → CAD amount
  - Map runoff index (0-10) to estimated water treatment cost
  - Only significant for agricultural products with heavy fertilizer use

### Step 7: Externality Aggregator

Combine all externality costs into a single output.

- Implement `calculateTotalExternality(product, userContext)` → full externality breakdown
- Flow:
  1. Gemini lifecycle research (Step 2)
  2. Carbon cost (Step 3)
  3. Water cost with scarcity adjustment (Step 4)
  4. Packaging cost with recycling context (Step 5)
  5. Land use cost (Step 6)
  6. Eutrophication cost (Step 6)
  7. Sum all costs
- Return:
  ```
  {
    externality_cost: number,       // total in CAD
    carbon: { cost, kg_CO2e },
    water: { cost, litres, scarcity },
    packaging: { cost, materials[] },
    land_use: { cost, m2 },
    eutrophication: { cost, index },
    total_cost: shelf_price + gas_cost + externality_cost
  }
  ```

### Step 8: Externality Display Component

Build the UI that shows the hidden cost breakdown.

- Create a product card extension showing externality breakdown
- Display: shelf price, each externality line item, total true cost
- "Society pays the other $X.XX" summary line
- Comparative framing: when showing two products, highlight when the "expensive" one
  is actually cheaper in total cost
- Tap any externality line → methodology tooltip explaining the calculation

### Step 9: Externality Cache

Cache calculated externalities to avoid redundant Gemini calls.

- Cache key: `externality:{product_id}:{user_postal_code}`
- TTL: 24 hours (externality quantities don't change; hyperlocal adjustments may)
- Store the full breakdown, not just the total

## Key Files to Create

```
src/config/externalityPricing.ts           — pricing constants and annual schedule
src/services/externality/lifecycle.ts       — Gemini lifecycle research prompt
src/services/externality/carbon.ts          — carbon cost calculator
src/services/externality/water.ts           — water cost calculator
src/services/externality/packaging.ts       — packaging cost calculator
src/services/externality/landUse.ts         — land use + eutrophication calculators
src/services/externality/aggregator.ts      — combine all costs
src/services/externality/cache.ts           — externality cache layer
src/components/ExternalityBreakdown.tsx     — hidden cost display component
src/types/externality.ts                    — shared type definitions
```

## Testing Approach

- Unit test each calculator with known inputs → verify CAD outputs
- Test carbon cost: verify against manual calculation at $110/tonne
- Test water cost: same product, different stress regions → different costs
- Test packaging cost: recyclable vs non-recyclable locally → cost difference
- Test Gemini prompt: verify structured output for 10+ products across categories
- Integration test: scan product → externality calculated → display renders correctly
- Verify comparative framing: Product A cheaper at shelf but more expensive in total

## Definition of Done

- All 5 externality categories calculated and monetized in CAD
- Carbon cost uses Canada's federal carbon price ($110/tonne in 2026)
- Water cost adjusts for regional scarcity via Hyperlocal Engine
- Packaging cost adjusts for local recycling capability
- Full breakdown displayed to user with methodology transparency
- Comparative framing highlights when "expensive" products are actually cheaper in total
- Externality calculation completes within 4 seconds per product
