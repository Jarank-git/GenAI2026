# Feature Design: True Cost Externality Pricing

## Overview

Calculates and displays the hidden environmental cost of every product — the damage not
reflected in the shelf price. Grounds these costs in established economic models, anchored
by Canada's federal carbon price.

## Problem Statement

The shelf price is incomplete. It excludes carbon emissions, water depletion, plastic
pollution, and ecosystem damage. These costs are real — they're paid by society through
healthcare, environmental remediation, and climate adaptation. Making them visible changes
purchasing decisions.

## Core Message

"Every product has two prices. The one you pay, and the one the planet pays. EcoLens shows both."

## Externality Categories

| Category | Pricing Basis | Data Source |
|----------|--------------|-------------|
| Carbon emissions | Canada's federal carbon price: ~$110/tonne CO2e (2026), rising $15/yr to $170 by 2030 | ECCC Carbon Pricing policy |
| Water consumption | Local water scarcity premium: varies by region based on stress index | ECCC Hydrometric + WRI Aqueduct |
| Plastic packaging | End-of-life cost: cleanup, landfill, ocean damage per kg plastic | Published academic studies |
| Land use change | Deforestation/habitat loss cost per hectare converted | Environmental economics literature |
| Eutrophication | Downstream water treatment costs from fertilizer runoff | ECCC Water Quality Monitoring |

## Calculation Pipeline

### Step 1: Lifecycle Research (Gemini)

Gemini researches the product's full lifecycle:
- Raw materials → manufacturing → transport → packaging → end-of-life
- Each stage mapped to externality categories
- Example: beef production → high carbon (methane), high water, high land use

### Step 2: Externality Quantification

For each category, Gemini estimates physical quantities:
- Carbon: kg CO2e across lifecycle
- Water: litres consumed in production
- Plastic: grams of packaging material by type
- Land use: m² of land-use-change attributable to product category
- Eutrophication: estimated fertilizer runoff impact (indexed)

### Step 3: Monetization

Physical quantities converted to CAD using pricing models:
- **Carbon**: `kg_CO2e × ($110 / 1000)` = cost per kg at current carbon price
- **Water**: `litres × regional_scarcity_multiplier × base_water_cost`
- **Plastic**: `grams × end_of_life_cost_per_gram` (varies by plastic type and local recycling)
- **Land use**: `m² × deforestation_cost_per_m²` (commodity-specific coefficients)
- **Eutrophication**: indexed against water treatment cost benchmarks

### Step 4: Hyperlocal Adjustment

- Water costs scaled by user's regional water stress index
- Carbon costs adjusted if product manufactured using user's provincial grid
- Plastic costs adjusted by local recycling capability (non-recyclable = higher cost)

### Step 5: Aggregation

```
externality_cost = carbon_cost + water_cost + plastic_cost
                   + land_use_cost + eutrophication_cost
total_cost = shelf_price + gas_cost + externality_cost
```

## Display Design

### Product Card — Externality Breakdown

```
┌──────────────────────────────────┐
│  No Name Organic Penne           │
│                                  │
│  Shelf Price:         $2.49      │
│  ── Hidden Costs ──────────────  │
│  Carbon footprint:    +$0.38     │
│  Water usage:         +$0.12     │
│  Packaging waste:     +$0.45     │
│  Transport emissions: +$0.22     │
│  ─────────────────────────────── │
│  TRUE COST:           $3.66      │
│                                  │
│  "Society pays the other $1.17"  │
└──────────────────────────────────┘
```

### Comparative Framing

When showing alternatives side by side:

```
Product A: $2.49 shelf → $3.66 total cost (sustainability: 61)
Product B: $3.29 shelf → $3.52 total cost (sustainability: 84)

"Product B costs $0.80 more at checkout but $0.14 LESS
 when you count what the planet pays."
```

This reframing is the key insight — sometimes the "expensive" product is actually cheaper.

## Cost Terminology (App-Wide Standard)

| Term | Definition |
|------|-----------|
| Out-of-Pocket Cost | shelf price + gas cost to store (what you pay) |
| Externality Cost | monetized environmental damage (what society pays) |
| Total Cost | out-of-pocket + externality (full picture) |

## Precision & Transparency

- Externality costs displayed to nearest cent (CAD)
- Each category shows its contribution — users can tap for methodology explanation
- Carbon price clearly cited: "Based on Canada's federal carbon price of $110/tonne CO2e"
- Uncertainties acknowledged: "Estimates based on lifecycle research. Actual impact may vary."

## Dependencies

- Gemini API (lifecycle research, quantity estimation)
- ECCC Carbon Pricing (federal carbon price reference)
- Hyperlocal Context Engine (regional adjustments)
- ECCC Hydrometric Data + WRI Aqueduct (water stress)
- Published externality cost studies (plastic, land use, eutrophication coefficients)

## Success Metrics

- Externality cost available for > 85% of scanned products
- Comparative reframing changes perceived "cheapest" product in > 30% of comparisons
- User comprehension: > 75% of tested users correctly explain what externality cost means

## Open Questions

- Should externality cost update as the carbon price changes yearly ($15/yr increase)?
- How to present uncertainty without undermining trust? (ranges vs point estimates)
- Should cumulative externality tracking be part of the carbon wallet feature?
- How to handle products where lifecycle data is genuinely unavailable?
