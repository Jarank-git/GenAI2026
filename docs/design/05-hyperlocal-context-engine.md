# Feature Design: Hyperlocal Context Engine

## Current Status: REAL API INTEGRATION PHASE
- Scaffolding: COMPLETE — all 7 hyperlocal dimensions are built with static data and mock fallbacks
- Geocoding: NO Google Maps key — uses postal prefix fallback (works for major cities)
- Grid emissions, seasonal produce, vehicle data: Real static data (JSON files), fully functional
- Water stress: Hardcoded regional data, functional
- Gas prices: Mock per-province prices, functional
- Recycling: Mock city lookup tables — has TODO for real Gemini research
- Onboarding flow: Fully functional, saves to localStorage
- **Goal: Get real recycling data from Gemini API for the user's city instead of hardcoded lookup tables**

## Overview

The personalization layer that makes EcoLens scores meaningful. Every score passes through
this engine, which adjusts based on the user's vehicle, location, provincial energy grid,
local water stress, municipal recycling capabilities, and seasonal context.

## Development Context

> API keys are configured in `.env.local`. Services should use real APIs and only fall back to mock data when keys are missing.
>
> Static datasets (NRCan vehicles, seasonal produce, grid intensity factors) are embedded as JSON files in `src/data/` — these work without API keys. Geocoding falls back to postal prefix lookup when Google Maps key is unavailable. Recycling lookup should use Gemini API for real municipal data.

## Problem Statement

A sustainability score that's identical in Calgary and Vancouver is misleading. Alberta's
grid is carbon-heavy (natural gas); BC's is clean (hydro). The same electric-manufactured
product has vastly different carbon footprints depending on where it's made and consumed.
No existing app personalizes to actual user circumstances.

## Core Thesis

"Two people scan the same box of pasta. One drives a Civic in Vancouver, the other drives
an F-150 in Calgary. They get different scores, different costs, different recommendations."

## Context Dimensions

### A. Vehicle Profile

- **Input**: user selects make/model/year on setup (or "no car / transit / bike")
- **Data source**: NRCan Fuel Consumption Ratings (L/100km, city/highway/combined, 1995-2026)
- **Output**: personalized gas cost per km driven
- **Formula**: `gas_cost = (distance_km × L_per_100km / 100) × local_gas_price_per_litre`
- **EV variant**: `electricity_cost = (distance_km × kWh_per_km) × provincial_kWh_price`
- **Transit/bike**: transport cost = $0, transport emissions = 0
- **Impact**: changes out-of-pocket cost for every alternative at every store

### B. Provincial Energy Grid

- **Data sources**:
  - ECCC Grid Emission Intensity Factors: official gCO2eq/kWh by province/territory
  - High-Frequency Electricity Data (HFED): near-real-time generation mix by fuel type,
    all 13 provinces/territories (JSON API via energy-information.canada.ca)
- **Application**: products requiring refrigeration, electric processing, or local
  manufacturing carry different footprints based on grid carbon intensity
- **Example**: factory in Quebec (98% hydro, ~1.2 gCO2/kWh) vs same factory in
  Alberta (~370 gCO2/kWh, heavy natural gas) — orders of magnitude difference
- **Impact**: adjusts production method score and transport emissions calculation

### C. Local Water Stress

- **Data sources**:
  - ECCC Real-Time Hydrometric Data: water level/flow from 2,100+ stations
    (OGC API, GeoJSON via api.weather.gc.ca)
  - WRI Aqueduct Water Risk Atlas: sub-basin water stress indices (GIS shapefiles)
- **Application**: water-intensive products (beef, almonds, cotton) receive penalty
  multipliers in water-stressed regions
- **Example**: almonds score 72/100 in Ontario but 58/100 in drought-affected southern Prairies
- **Impact**: adjusts sustainability score via water factor penalty (up to -15 pts)

### D. Municipal Recycling Capabilities

- **Input**: user's postal code
- **Mechanism**: Gemini researches what the local recycling program actually accepts
- **Key insight**: "recyclable" packaging is meaningless if local facility can't process it
- **Example**: #5 polypropylene marked recyclable → check if local facility handles #5 →
  if not, packaging score treats it as landfill
- **Cross-reference**: many municipalities use ReCollect platform for "What Goes Where"
- **Impact**: adjusts packaging and end-of-life scores

### E. Seasonal & Climate Awareness

- **Input**: user's location + current date
- **Logic**: determine what produce is in-season locally
- **Application**: out-of-season produce was either greenhouse-grown (energy-intensive) or
  imported long-distance (transport-intensive) — apply appropriate penalties
- **Example**: "It's March in Ontario. This tomato was either greenhouse-grown or shipped
  from Mexico/California. Sustainability adjusted."
- **Impact**: adjusts transport and production scores for food products

## Onboarding Flow

```
First launch → "Let's personalize your scores"
  → Enter postal code
    → Auto-fills: provincial grid, water stress zone, recycling program, season data
  → Select vehicle (dropdown: make/model/year from NRCan database)
    → Or select: "no car / transit / bike"
  → Optional: dietary restrictions, household size
  → "Your EcoLens is calibrated. Scores are now personal to you."
```

## Data Refresh Cadence

| Dimension | Refresh Frequency | Trigger |
|-----------|------------------|---------|
| Vehicle profile | On user change | Manual update |
| Grid intensity | Daily | HFED API pull |
| Water stress | Weekly | ECCC hydrometric data pull |
| Recycling capabilities | Monthly | Gemini re-research on postal code |
| Seasonal data | Monthly | Calendar-based + location |
| Gas prices | Weekly | NRCan/Ontario gasoline data pull |

## Adjustment Mechanics

Hyperlocal adjustments are applied as post-base-score modifications:

```
final_score = base_score + water_adjustment + recycling_adjustment
              + seasonal_adjustment + grid_adjustment
```

All adjustments are negative (penalties) or zero. They cannot increase the base score.
Final score clamped to [0, 100].

## Dependencies

- NRCan Fuel Consumption Ratings dataset
- NRCan / Ontario gasoline price datasets
- ECCC Grid Emission Intensity Factors
- HFED API (Canada Energy Regulator)
- ECCC Real-Time Hydrometric Data API
- WRI Aqueduct Water Risk Atlas
- Gemini API (recycling research)
- Google Maps Geocoding API (postal code → coordinates)

## Success Metrics

- Personalization impact: > 60% of products show measurable score difference vs generic score
- Onboarding completion: > 80% of users complete full setup (postal code + vehicle)
- Data freshness: grid and water data updated within stated cadence 99% of the time

## Open Questions

- How much onboarding friction is acceptable vs inferring context over time?
- Should users see WHY their score differs from generic? (e.g., "Your Alberta grid adds +$0.12")
- Should there be a "compare locations" feature showing how scores change across provinces?
