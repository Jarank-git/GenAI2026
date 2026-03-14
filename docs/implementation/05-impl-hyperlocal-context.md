# Implementation Plan: Hyperlocal Context Engine

> Design doc: `docs/design/05-hyperlocal-context-engine.md`

## Prerequisites

- ~~Google Maps Geocoding API key configured~~ → **NOT AVAILABLE — use mock**
- NRCan datasets — **publicly available CSVs, can be embedded as static JSON**
- ECCC grid data — **publicly available, can be embedded as static JSON**
- ~~HFED real-time API~~ → **NOT AVAILABLE — use static ECCC values instead**
- No feature dependencies — this is a foundational feature (build early)

## Development Context — NO API CREDENTIALS

**You do not have API keys.** However, much of this feature uses **publicly available static datasets** that can be embedded directly:

**Build fully with embedded data (no API needed):**
- NRCan vehicle fuel consumption data → download CSV, parse to JSON, embed in `src/data/`
- ECCC grid emission intensity factors → embed as `src/data/grid-intensity.json`
- Seasonal produce calendar → build static lookup table in `src/data/seasonal-produce.json`
- User profile data model + onboarding UI → pure client-side code

**Build with mock/real toggle:**
- Geocoding (Step 2): mock with hardcoded lat/lng for Toronto, Calgary, Vancouver, Montreal
- Gas prices (Step 4): use recent NRCan published averages as hardcoded fallback
- Water stress (Step 6): mock with hardcoded stress indices for major regions
- Recycling lookup (Step 7): mock with hardcoded recycling lists for Toronto, Calgary, Vancouver

**Create `src/data/mock-hyperlocal.ts`** with realistic context data for 3-4 Canadian cities so the adjustment calculator can be fully tested.

**Testing with real APIs will happen in a separate session.**

## Build Order

### Step 1: User Profile & Onboarding Data Model

Define the persistent user profile that stores personalization inputs.

- Create type: `UserProfile` with fields:
  - `postal_code: string`
  - `province: string` (derived from postal code)
  - `coordinates: { lat, lng }` (from geocoding)
  - `vehicle: { make, model, year, fuel_type, l_per_100km } | "transit" | "bike"`
  - `household_size?: number`
  - `dietary_restrictions?: string[]`
- Store in local storage / device storage (persists across sessions)
- Implement `createProfile(onboardingInput)` → validated UserProfile
- Validate postal code format (Canadian: A1A 1A1)

### Step 2: Postal Code Geocoding

Convert postal code to coordinates and derive province.

- Implement `geocodePostalCode(postalCode)` → `{ lat, lng, province, city }`
- Use Google Maps Geocoding API: `GET geocode/json?address={postalCode},Canada`
- Extract province from address components
- Cache result: postal code rarely changes, no need to re-geocode
- Province determines: grid data, water stress zone, seasonal rules

### Step 3: Vehicle Profile — NRCan Fuel Data

Load vehicle fuel consumption data from NRCan.

- Download NRCan Fuel Consumption Ratings CSV (1995-2026)
- Parse and index by: make → model → year → fuel consumption (L/100km combined)
- Implement `lookupVehicle(make, model, year)` → `{ l_per_100km, fuel_type }`
- Build searchable dropdown data for onboarding UI (make → model → year cascade)
- EV lookup: kWh/100km from NRCan's EV-specific dataset
- Special cases: "no car / transit / bike" → transport cost = $0

### Step 4: Gas Price Service

Fetch current local gas prices for transport cost calculation.

- Implement `getGasPrice(province, city?)` → price in CAD per litre
- Primary source: NRCan Gasoline Prices CSV (monthly, 11 cities)
- Supplementary: Ontario Gasoline Report (weekly, 10 markets)
- Fallback: Gemini grounded search for real-time local gas price
- Cache for 7 days (weekly refresh cadence)
- Return: `{ price_per_litre, source, last_updated }`

### Step 5: Provincial Grid Emission Data

Fetch carbon intensity data for the user's province.

- Implement `getGridIntensity(province)` → `{ gCO2_per_kWh, generation_mix }`
- Primary: ECCC Grid Emission Intensity Factors CSV (annual official values)
- Real-time supplement: HFED JSON API (near-real-time generation mix by fuel type)
  - Endpoint: `energy-information.canada.ca` electricity data API
- Store static ECCC values as embedded config (updated annually)
- Refresh HFED data daily via background fetch
- Output used by: scoring adjustments (production penalty) + EV cost calculations

### Step 6: Water Stress Index

Determine the user's local water stress level.

- Implement `getWaterStress(lat, lng)` → `{ stress_index, stress_level, basin_name }`
- Primary: WRI Aqueduct Water Risk Atlas (pre-processed GIS shapefiles)
  - Pre-process: convert to a lookup table mapping lat/lng regions to stress indices
- Supplement: ECCC Real-Time Hydrometric Data for current conditions
  - OGC API at `api.weather.gc.ca` → nearest stations' water levels
- Stress levels: LOW (0-1), MEDIUM (1-2), HIGH (2-3), VERY HIGH (3-5)
- Cache: update weekly
- Output: water stress multiplier used in scoring adjustments

### Step 7: Municipal Recycling Lookup

Determine what the user's local recycling program actually accepts.

- Implement `getRecyclingCapabilities(postalCode)` → `{ accepted_materials[], source }`
- Use Gemini to research: "What materials does the recycling program in [city/municipality]
  accept? Specifically: #1-#7 plastics, glass, cardboard, aluminum, tetrapak, compostables"
- Cross-reference ReCollect platform if municipality uses it
- Cache for 30 days (recycling programs change infrequently)
- Output: list of accepted material codes used to score packaging recyclability

### Step 8: Seasonal Produce Calendar

Determine what produce is in-season for the user's region.

- Implement `getSeasonalProduce(province, month)` → `{ in_season_items[] }`
- Build a static lookup table: province × month → list of in-season produce
- Source data from Canadian agricultural calendars + Gemini research
- On product scan: check if scanned produce item is in the seasonal list
- If out-of-season → flag for penalty in scoring adjustments
- Cache: static data, refresh monthly

### Step 9: Adjustment Calculator

Combine all context dimensions into scoring adjustment values.

- Implement `calculateAdjustments(product, userContext)` → `{ adjustments[] }`
- Adjustment rules:
  - Water: if product is water-intensive AND user in HIGH/VERY HIGH stress → -10 to -15 pts
  - Recycling: if packaging material not in local accepted list → -15 to -20 pts
  - Seasonal: if food product AND out of season → -10 to -20 pts
  - Grid: if product electrically manufactured AND user in high-carbon province → -5 to -10 pts
- All adjustments are penalties (negative or zero)
- Return array of `{ type, penalty_points, reason_text }` for transparency

### Step 10: Onboarding UI

Build the first-launch personalization flow.

- Screen 1: "Enter your postal code" → auto-fills province, city, grid, water zone
- Screen 2: "What do you drive?" → cascading dropdown (make → model → year) or "no car"
- Screen 3 (optional): household size, dietary restrictions
- Confirmation: "Your EcoLens is calibrated. Scores are now personal to you."
- Skip option: use defaults (Ontario, average vehicle, no adjustments)
- Profile editable later from settings

## Key Files to Create

```
src/types/userProfile.ts                   — UserProfile type
src/services/hyperlocal/geocoding.ts       — postal code → coordinates/province
src/services/hyperlocal/vehicleData.ts     — NRCan vehicle fuel lookup
src/services/hyperlocal/gasPrice.ts        — current gas price service
src/services/hyperlocal/gridEmissions.ts   — provincial grid intensity
src/services/hyperlocal/waterStress.ts     — water stress index lookup
src/services/hyperlocal/recycling.ts       — municipal recycling capabilities
src/services/hyperlocal/seasonal.ts        — seasonal produce calendar
src/services/hyperlocal/adjustments.ts     — adjustment calculator
src/data/nrcan-vehicles.json               — parsed NRCan fuel data
src/data/seasonal-produce.json             — province × month produce calendar
src/data/grid-intensity.json               — ECCC grid emission factors
src/components/Onboarding.tsx              — personalization flow UI
```

## Testing Approach

- Test geocoding: verify province extraction for postal codes across all provinces
- Test vehicle lookup: verify L/100km for known makes/models/years
- Test grid intensity: compare values against published ECCC data
- Test water stress: verify HIGH stress zones match known drought-prone areas
- Test adjustment calculator: same product in different locations → different adjustments
- Test onboarding: complete flow → profile persisted → adjustments applied on next scan
- Integration test: scan product → hyperlocal adjustments modify score meaningfully

## Definition of Done

- User completes onboarding: postal code + vehicle → profile persisted
- Gas prices fetched for user's region with weekly refresh
- Grid intensity loaded for user's province (static + HFED real-time)
- Water stress determined for user's location
- Recycling capabilities researched for user's municipality
- Seasonal produce calendar populated for user's province
- Adjustment calculator produces meaningful penalties that vary by location
- All context data refreshes at stated cadence without manual intervention
