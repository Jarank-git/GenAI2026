# Implementation Plan: Sustainability Scoring Algorithm

> Design doc: `docs/design/03-sustainability-scoring.md`

## Prerequisites

- Feature 01 (Product Scanning) must be complete — scoring needs product identity + category
- Feature 05 (Hyperlocal Context Engine) should be complete — provides adjustment multipliers
- Gemini API key configured
- Open Food Facts API access
- Google Maps API key for distance calculations

## Build Order

### Step 1: Category Weight Configuration

Define the scoring weight tables as a configuration module.

- Create a config file mapping product categories to weight distributions
- Categories: food_beverage, cleaning, personal_care, clothing, electronics, home_goods
- Each category defines weights for: transport, packaging, certifications, brand_ethics,
  production, end_of_life (must sum to 100)
- Include a `default` category using the food_beverage weights as fallback
- Make weights easily adjustable without code changes (JSON config or constants file)

### Step 2: Gemini Sustainability Research Prompt

Build the structured prompt that extracts sustainability data from Gemini.

- Implement `researchSustainability(product)` → returns structured factor data
- Prompt must request all 6 factors with numerical scores (0-100 each):
  1. Transport distance and origin
  2. Packaging materials and recyclability
  3. Certifications held
  4. Brand ethics and labor practices
  5. Production method and resource intensity
  6. End-of-life / disposal impact
- Use Gemini's JSON mode to enforce structured output schema
- Include Canadian context in prompt: "This product is sold in Canada. Consider Canadian
  certifications (Canada Organic, Ocean Wise), Canadian supply chains, and local context."
- Parse and validate response: each factor must be 0-100, reject malformed responses

### Step 3: Open Food Facts Enrichment

Supplement Gemini data with structured data from Open Food Facts.

- Implement `enrichWithOFF(product)` → returns eco-score, certifications, packaging info
- Query Open Food Facts for the product (by barcode or name search)
- Extract: ecoscore_grade, nova_group, labels/certifications, packaging materials
- Use OFF data to validate/calibrate Gemini's certification and packaging scores
- If OFF eco-score exists, use it as a reference point (not override) for Gemini's output

### Step 4: Transport Distance Scoring

Calculate the transport score using origin data + Google Maps.

- Implement `scoreTransport(product, userLocation)` → returns 0-100 score
- Gemini provides country/region of origin in Step 2
- Estimate transport distance: origin country → Canadian port/border → user's city
- Use a lookup table for common origins (Italy, China, USA, Mexico, local Canadian)
- Scoring scale: local (< 500km) = 90-100, domestic = 70-89, continental = 40-69,
  intercontinental = 0-39
- Factor in transport mode (air vs ship vs truck) from Gemini's research

### Step 5: Base Score Calculator

Combine individual factor scores with category weights.

- Implement `calculateBaseScore(factorScores, category)` → returns 0-100 base score
- Load weights from Step 1 config for the given category
- Formula: `base_score = sum(factor_score[i] × weight[i]) for i in factors`
- Validate: result must be 0-100, reject if any factor is missing (mark as "Insufficient Data")
- Return base score + factor breakdown for UI display

### Step 6: Hyperlocal Adjustment Layer

Apply post-base-score penalties from the Hyperlocal Context Engine.

- Implement `applyHyperlocalAdjustments(baseScore, product, userContext)` → returns final score
- Fetch adjustment values from Hyperlocal Engine (Feature 05):
  - Water stress penalty (0 to -15)
  - Recycling capability penalty (0 to -20)
  - Seasonal penalty (0 to -20)
  - Grid carbon penalty (0 to -10)
- Apply: `final_score = clamp(base_score + sum(adjustments), 0, 100)`
- Return adjustments breakdown alongside final score for transparency

### Step 7: Score Interpretation & Output

Map the final score to labels, colors, and display-ready format.

- Implement `interpretScore(finalScore)` → returns `{ score, label, color, factors, adjustments }`
- Score ranges: 80-100 Excellent (green), 60-79 Good (yellow-green), 40-59 Average (yellow),
  20-39 Poor (orange), 0-19 Very Poor (red)
- Package the full breakdown: base score, each factor score, each hyperlocal adjustment
- This is the output consumed by Sorting Modes (Feature 04) and all display components

### Step 8: Scoring Orchestrator

Wire the full scoring pipeline end-to-end.

- Implement `scoreProduct(product, userContext)` → returns full score object
- Flow:
  1. Gemini sustainability research (Step 2)
  2. Open Food Facts enrichment (Step 3) — in parallel with Step 2
  3. Transport distance scoring (Step 4)
  4. Merge factor scores
  5. Calculate base score with category weights (Step 5)
  6. Apply hyperlocal adjustments (Step 6)
  7. Interpret and package output (Step 7)
- Cache scored products: key = `score:{product_id}:{user_postal_code}`, TTL = 24 hours

## Key Files to Create

```
src/config/categoryWeights.ts          — weight tables per category
src/services/scoring/geminiResearch.ts  — sustainability research prompt
src/services/scoring/offEnrichment.ts   — Open Food Facts data enrichment
src/services/scoring/transport.ts       — transport distance scoring
src/services/scoring/baseCalculator.ts  — weighted score calculation
src/services/scoring/hyperlocalAdj.ts   — hyperlocal penalty application
src/services/scoring/interpreter.ts     — score → label/color mapping
src/orchestrators/scoringPipeline.ts    — end-to-end orchestrator
src/types/scoring.ts                    — shared type definitions
```

## Testing Approach

- Unit test weight application: verify weights sum to 100 for all categories
- Test Gemini prompt with 10+ products across categories — verify structured output parsing
- Test hyperlocal adjustments: same product, different locations → different final scores
- Verify score consistency: same product scanned 5 times → scores within ±3 points
- Test edge cases: missing factor data, unknown category, zero-score factors
- Integration test: product identification → scoring → display-ready output

## Definition of Done

- All 6 sustainability factors scored per product via Gemini + Open Food Facts
- Category-specific weights applied correctly
- Hyperlocal adjustments modify base score based on user's location context
- Scores are consistent (±3 pts on repeat) and calibrated against known good/bad products
- Full scoring pipeline completes within 4 seconds per product
- Score breakdown (factors + adjustments) available for UI display
