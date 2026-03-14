# EcoLens — The True Cost of What You Buy

> A Canadian-focused app that reveals the hidden price tag on every product: environmental, ethical, and financial — personalized to your life.

---

## Core Thesis

Existing sustainability apps give generic scores. EcoLens is different: **the same product gets a different score depending on who you are, where you live, what you drive, and what your local infrastructure can actually handle.** It makes invisible costs visible and meets users where they already are — at the receipt, not the shelf.

---

## Core Product Experience — Scan, Compare, Sort

This is the foundational user flow that everything else builds on.

### How It Works

1. **User scans or photographs a product** (e.g., a box of pasta) using their phone camera
2. **Cloudinary** processes the image — handles image enhancement, OCR on labels, barcode detection, and product identification
3. **Live pricing is fetched through a multi-layer system** (see [Pricing Data Architecture](#pricing-data-architecture) below):
   - **Layer 1 — PC Express API**: queries the Loblaws internal API (`api.pcexpress.ca`) for structured product data with real prices across all Loblaw banners (Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart)
   - **Layer 2 — Gemini with Google Search Grounding**: for stores without APIs (Walmart, Metro, Sobeys, etc.), Gemini issues live Google searches to find indexed flyer deals, advertised sale prices, and current pricing from Flipp.com, RedFlagDeals, and retailer flyer pages
   - **No hallucinated prices** — Gemini never guesses prices; it either has real data from Layer 1 or grounded search results from Layer 2
4. **Gemini API** takes the identified product + real pricing data and:
   - Researches sustainability data (sourcing, packaging, certifications, brand practices)
   - Identifies alternative products in the same category (other pasta brands)
   - Calculates sustainability scores using the real pricing data provided to it
5. **Google Maps API** calculates distances from the user's current location to each store that carries an alternative, and factors in gas cost based on the user's vehicle and current local gas prices
6. **The app returns a ranked list of alternatives** that the user can sort and filter

### The Four Sorting Modes

This is the core interaction. Once alternatives are loaded, the user can sort by four distinct rankings:

#### 1. Best Sustainability Score
- Sorted by the highest adjusted sustainability score (0-100)
- Pure environmental/ethical ranking — ignores price entirely
- For the user who asks: "What's the greenest option, period?"

#### 2. Best Price
- Sorted by lowest **out-of-pocket cost** = shelf price + gas cost to reach the store
- Gas cost = (distance to store in km × vehicle's L/100km / 100) × current local gas price per litre
- Google Maps Distance Matrix API provides driving distance; gas prices sourced from NRCan Open Data (monthly by city) or Gemini for real-time lookup
- For the user who asks: "What's cheapest when I factor in the drive?"

#### 3. Best Sustainability-to-Price Ratio (Sweet Spot)
- Sorted by: `Sustainability Score / Total Cost`
- Total Cost = shelf price + gas cost + externality cost (the full picture)
- High sustainability + low total cost = highest ratio
- This is the **recommended default sort** — it answers the question most people actually have: "What's the best I can do without overpaying?"
- Example: Product A scores 85 sustainability at $4.12 total cost → ratio of 20.6. Product B scores 60 at $2.33 total cost → ratio of 25.8. Product B is the better *value* even though A is greener.

#### 4. Lowest Externality Cost (Planet Pick)
- Sorted by: externality cost (hidden environmental cost) ascending
- Answers: "Which product does the least environmental damage, in dollar terms?"
- Different from mode 1 (pure sustainability score) because this uses the monetized externality values from Feature 3 — grounded in Canada's carbon price, water scarcity premiums, and packaging waste costs
- A product could score well on sustainability (good certifications, ethical brand) but still have high externalities (heavy packaging, long transport). This mode surfaces the lowest real-world damage

### Example Output — Pasta Category

```
┌───────────────────────────────────────────────────────────────────┐
│  You scanned: No Name Classic Penne — $2.49 @ No Frills          │
│  Sustainability: 52/100  │  Out-of-Pocket: $2.89                  │
│  Externality Cost: +$0.95  │  Total Cost: $3.84                   │
│                                                                   │
│  Sort by: [Green] [Budget] [Sweet Spot] [Planet Pick]             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Catelli Organic Penne                          ✓ Verified     │
│     Sustainability: 91/100  │  Shelf: $3.49                       │
│     Gas to Loblaws (3.7 km): $0.85                                │
│     Out-of-Pocket: $4.34  │  Externality: +$0.62                  │
│     Total Cost: $4.96  │  Ratio: ★★★★☆                           │
│                                                                   │
│  2. PC Blue Menu Penne                             ✓ Verified     │
│     Sustainability: 74/100  │  Shelf: $1.89                       │
│     Gas to Real Canadian Superstore (1.8 km): $0.40               │
│     Out-of-Pocket: $2.29  │  Externality: +$0.88                  │
│     Total Cost: $3.17  │  Ratio: ★★★★☆                           │
│                                                                   │
│  3. Barilla Penne                                  ~ Web estimate │
│     Sustainability: 63/100  │  Shelf: $2.79                       │
│     Gas to Walmart (3.1 km): $0.72                                │
│     Out-of-Pocket: $3.51  │  Externality: +$1.04                  │
│     Total Cost: $4.55  │  Ratio: ★★★☆☆                           │
│                                                                   │
│  4. De Cecco Import Penne                          ~ Web estimate │
│     Sustainability: 41/100  │  Shelf: $5.99                       │
│     Gas to Specialty Store (7.5 km): $1.73                        │
│     Out-of-Pocket: $7.72  │  Externality: +$2.14                  │
│     Total Cost: $9.86  │  Ratio: ★☆☆☆☆                           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

Price confidence: ✓ Verified (from PC Express API) | ~ Web estimate (from flyer/search data)
```

### Category Agnostic

This isn't limited to food. The same scan → compare → sort flow works for:
- **Cleaning products** — sustainability of chemicals, packaging, brand practices
- **Personal care** — ingredients sourcing, animal testing, plastic waste
- **Clothing** — labor practices, material sourcing, shipping distance
- **Electronics** — repairability, conflict minerals, e-waste programs
- **Home goods** — material sustainability, manufacturing origin, durability

Gemini handles the research regardless of product category. The scoring weights shift by category (e.g., labor practices weigh more for clothing, packaging weighs more for beverages), but the framework is the same.

**Pricing by category:** The PC Express API (Layer 1) only covers grocery products. For non-grocery categories, pricing relies entirely on Layer 2 (Gemini with Google Search Grounding), which can find prices from Canadian retailers indexed by Google — e.g., Canadian Tire, Amazon.ca, Best Buy Canada, Hudson's Bay. Google Shopping results are stronger for electronics and home goods than for groceries, so Layer 2 is actually more reliable for non-food products.

---

## Technical Stack

### Cloudinary — Image Processing Layer
- **Primary role**: all image intake and processing throughout the app
- Handles product photo enhancement, normalization, and preparation
- OCR for receipt scanning (extracting line items, prices, store info)
- Object detection for AR shelf scanning (isolating individual products on a shelf)
- Barcode/label detection and reading
- AR overlay image generation (annotated shelf photos with scores)
- Cloudinary was chosen for its comprehensive image pipeline — upload, transform, analyze, and serve all in one service

### Google Maps Platform — Location & Distance Layer
- **Distance Matrix API**: calculates driving distance from user's current location to each store carrying an alternative product
- **Places API**: identifies nearby stores (grocery, retail, specialty) and their addresses
- **Geocoding API**: converts user's postal code to coordinates for hyperlocal context
- User grants location permission on app launch; all distance and store calculations flow through Google Maps
- Gas cost formula: `(driving distance in km × vehicle L/100km / 100) × local gas price per litre`
- Google Maps is the single source of truth for all distance-based calculations in the sustainability score and out-of-pocket cost

### Pricing Data Architecture

**Why this matters:** Gemini API (like all LLMs) will **hallucinate prices** if asked to guess. It has no real-time web access in its default mode. EcoLens solves this with a three-layer system that ensures every price shown to the user is real.

#### Layer 1 — PC Express Internal API (Primary, Structured Data)

The Loblaws group operates an internal product API at `api.pcexpress.ca` that returns structured JSON with real prices, availability, and product details. This covers a massive share of Canadian grocery:

- **Stores covered**: Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, Valu-mart, Your Independent Grocer, Fortinos, Zehrs, and all other Loblaw banners
- **Endpoint**: `POST https://api.pcexpress.ca/product-facade/v3/products/search`
- **Requires**: `X-Apikey` header and `Site-Banner` header (to specify which banner's pricing)
- **Returns**: product name, brand, price, unit price, size, availability, category, images
- **Why it works**: returns structured JSON — no parsing HTML, no JavaScript rendering issues, no hallucination risk
- **Limitation**: Loblaw banners only. No coverage for Walmart, Metro, Sobeys, Save-On-Foods, etc.

#### Layer 2 — Gemini with Google Search Grounding (Fallback, Live Web Search)

For stores without accessible APIs, Gemini API is called with **Grounding with Google Search** enabled. This is a specific Gemini feature that lets the model issue live Google Search queries and incorporate real, cited search results into its response.

- **How it works**: Gemini autonomously generates search queries (e.g., "Barilla penne price Walmart Canada March 2026"), processes the indexed results, and returns prices with source URLs
- **Sources it finds**: Flipp.com flyer deals, RedFlagDeals posts, retailer flyer pages indexed by Google, Google Shopping results
- **Key distinction**: this is NOT the model guessing — it's the model reading real Google search results and extracting prices from them
- **Cost**: ~$14 per 1,000 search queries the model executes (Gemini 3 models). Free tier: ~500-1,500 queries/day
- **Limitation**: not every price is indexed by Google. Works best for advertised sales, flyer deals, and well-known products at major retailers. May not find prices for niche or store-brand items at non-Loblaw stores
- **Confidence tagging**: when Layer 2 is used, the app displays a confidence indicator — "Verified price" (Layer 1) vs "Estimated from flyer/web data" (Layer 2) so the user knows the data source

#### Layer 3 — Gemini URL Context (Supplementary, Specific Pages)

When a specific retailer product page URL is known, Gemini's **URL Context tool** can fetch and read it directly (up to 20 URLs per request).

- **Use case**: if the app already knows the product page URL from a previous search, pass it directly for price extraction
- **Limitation**: only works with static HTML. Most Canadian grocery sites are JavaScript-heavy SPAs, so this is **unreliable as a primary source**. Used only as a supplement when URLs are known to be static/cached
- **Fallback behavior**: if URL Context fails to extract a price, the system falls back to Layer 2 (grounded search)

#### What This Means in Practice

```
User scans: Catelli Organic Penne

→ Layer 1 (PC Express API):
  - No Frills: $3.29 ✓ (verified, structured JSON)
  - Loblaws: $3.49 ✓ (verified, structured JSON)
  - Real Canadian Superstore: $3.19 ✓ (verified, structured JSON)

→ Layer 2 (Gemini + Google Search Grounding):
  - Walmart: $3.39 ~ (from Flipp.com flyer, indexed by Google)
  - Metro: $3.59 ~ (from metro.ca weekly flyer, indexed by Google)
  - Sobeys: not found — no indexed price data available

→ Result shown to user:
  5 stores with prices, confidence indicators on each
  Sobeys listed as "Price unavailable — visit store or check flyer"
```

#### Anti-Hallucination Safeguards

1. **Gemini never generates prices from its training data.** It only uses real-time data from Layer 1 (API) or Layer 2 (grounded search with citations)
2. **Every price has a source**: Layer 1 prices cite the API response; Layer 2 prices include the source URL from Google search results
3. **Missing data is shown as missing**, not fabricated. "Price unavailable" is always preferable to a made-up number
4. **Confidence indicators** are visible to the user: ✓ Verified (API) | ~ Web estimate (grounded search) | — Unavailable

### Gemini API — Intelligence Layer

With pricing handled by the layers above, Gemini focuses on what it's actually good at — research, analysis, and reasoning:

- **Product identification**: takes Cloudinary's processed image data and identifies the exact product
- **Sustainability research**: researches each product's sourcing, manufacturing, transport origin, brand practices, certifications, labor history
- **Category detection**: determines product category to apply appropriate scoring weights
- **Alternative discovery**: identifies competing products in the same category across brands
- **Score calculation**: takes real pricing data (from Layers 1-2) + sustainability research and computes the final scores
- **Natural language output**: generates human-readable comparisons, swap recommendations, and impact summaries
- **Gas price lookup**: uses Google Search Grounding to find current local gas prices (or pulls from NRCan Open Data as a baseline)

### Supporting APIs & Data Sources (All Canadian / Free)
| Service | Purpose | Format | Cost |
|---------|---------|--------|------|
| Open Food Facts API | Product database, eco-scores, ingredients (food/beverage) | REST API (JSON) | Free / open source |
| ECCC Grid Emission Intensity Factors | Official gCO2eq/kWh by province/territory | CSV from open.canada.ca | Free / public |
| High-Frequency Electricity Data (HFED) | Near-real-time generation mix by fuel type, all provinces | JSON API via energy-information.canada.ca | Free / public |
| ECCC Real-Time Hydrometric Data | Water level and flow from 2,100+ stations | OGC API (GeoJSON) via api.weather.gc.ca | Free / public |
| WRI Aqueduct Water Risk Atlas | Sub-basin water stress indices across Canada | GIS shapefiles (downloadable) | Free / open |
| NRCan Fuel Consumption Ratings | Vehicle fuel consumption (L/100km) by make/model/year, 1995-2026 | CSV from open.canada.ca | Free / public |
| NRCan Gasoline Prices | Monthly gas prices (¢/litre) for 11 major Canadian cities | CSV via CKAN API on open.canada.ca | Free / public |
| Ontario Gasoline Report | Weekly gas prices for 10 Ontario markets | CSV from data.ontario.ca | Free / public |
| Canada's Federal Carbon Price | Reference for externality pricing (~$110/tonne in 2026, rising to $170 by 2030) | Public policy reference | Public |
| Statistics Canada WDS API | Programmatic access to waste, energy, GHG, and price tables | REST API (JSON/SDMX) | Free (50 req/sec) |
| ECCC Air Quality Health Index (AQHI) | Real-time air quality by station | OGC API (GeoJSON) via api.weather.gc.ca | Free / public |
| NPRI (National Pollutant Release Inventory) | Facility-level pollutant releases across Canada | CSV/XLSX from open.canada.ca | Free / public |

---

## Extended Features

The following features build on top of the core scan → compare → sort experience.

### 1. Receipt Scanning — Retroactive Analysis

**The Problem:**
Nobody scans 30 products one by one while shopping. Existing apps demand behavior change *before* providing value. That's backwards.

**The Concept:**
- User photographs their grocery receipt after shopping
- Cloudinary processes the image via OCR, extracts line items and prices
- Gemini API maps each line item to a known product (fuzzy matching on store shorthand like "NN ORG PENNE" → No Name Organic Penne)
- For every item purchased, the app generates:
  - Its sustainability score (broken down by factors)
  - Its total cost (with externalities — see Feature 3)
  - The best sustainable alternative that was available
  - The best value-to-sustainability alternative
- Final output: a **Sustainability Receipt** showing:
  - Total spent: $87.42
  - Total cost (with externalities): $134.18
  - Overall sustainability score: 54/100
  - "Optimized basket" if you swapped key items: score 82/100 for $91.10
  - Exact items to swap next time, with store locations

**Key Design Decisions:**
- The receipt is the entry point, not the barrier. Zero friction to start.
- Fuzzy matching is critical — receipt shorthand is messy. Gemini handles ambiguity by cross-referencing store, price, and abbreviation patterns.
- The "optimized basket" isn't theoretical — it accounts for real stores near you, real prices (verified via PC Express API + grounded search), and real distances.

**User Flow:**
```
Open app → Tap "Scan Receipt" → Photograph receipt
    → Processing screen with progress bar (15-30 seconds for a full receipt)
        → Items appear as they resolve (OCR completes first, then pricing + sustainability load per item)
    → Sustainability Receipt appears
        → Tap any item for deep dive
        → Tap "Show Me Better Options" for swap recommendations
        → Tap "Save" to add to personal history / carbon wallet
```

**Performance note:** A 20-item receipt triggers ~20 Layer 1 API calls (batched), potentially 20 Layer 2 grounded searches (parallelized), and 1-2 batched Gemini sustainability calls. Items load progressively — OCR results appear in ~3 seconds, then pricing and sustainability scores stream in as they resolve.

---

### 2. Hyperlocal Context Engine

**The Problem:**
A "sustainability score" that's the same in Calgary, Alberta and Vancouver, British Columbia is lying. Context changes everything. No existing app personalizes to your actual circumstances.

**The Concept:**
Every score EcoLens generates passes through a **Hyperlocal Context Layer** that adjusts based on:

#### A. Your Vehicle Profile
- User inputs their car make/model/year on setup (or selects "no car / bike / transit")
- Pull NRCan Fuel Consumption Ratings for their specific vehicle (L/100km for city, highway, combined — the Canadian equivalent of EPA fuel economy)
- Gas cost to reach any store = (distance in km × L/100km fuel consumption / 100) × current local gas price per litre
- EV owners: electricity cost per km using provincial kWh pricing
- Transit/bike users: transport cost = $0, transport emissions = 0
- **This means out-of-pocket cost is different for every user even for the same product at the same store**

#### B. Your Provincial Energy Grid
- **ECCC Grid Emission Intensity Factors** provide official gCO2eq/kWh by province/territory (free, open data from Canada's GHG Inventory)
- **High-Frequency Electricity Data (HFED)** from Canada Energy Regulator provides near-real-time generation mix by fuel type for all 13 provinces/territories (JSON API at `energy-information.canada.ca`)
- Products that require refrigeration, electric processing, or are locally manufactured carry different footprints depending on whether your provincial grid runs on coal vs hydro vs nuclear
- Example: an electric-powered local factory in Quebec (98% hydro, ~1.2 gCO2/kWh) has a fraction of the carbon footprint of the same factory in Alberta (~370 gCO2/kWh, heavy natural gas)

#### C. Your Local Water Stress
- **ECCC Real-Time Hydrometric Data** provides water level and flow data from 2,100+ stations across Canada via OGC API at `api.weather.gc.ca` (free, GeoJSON format)
- **WRI Aqueduct Water Risk Atlas** provides sub-basin-level water stress indices for all of Canada (free, downloadable GIS data)
- **ECCC Water Withdrawal and Consumption by Sector** provides provincial water use data by sector
- Water-intensive products (beef, almonds, cotton) receive a penalty multiplier in water-stressed regions
- Example: almonds score 72/100 in Ontario but 58/100 in drought-affected areas of the southern Prairies because the local water stress is higher

#### D. Your Municipal Recycling Capabilities
- "Recyclable" packaging is meaningless if your local facility can't process it
- Gemini researches what your municipality's recycling program actually accepts
- Product with "#5 polypropylene" packaging → check if local facility handles #5
- If not: that packaging is effectively landfill, and the score reflects that
- User's postal code is the input; Gemini researches the local recycling program
- Many Canadian municipalities use the **ReCollect** platform for "What Goes Where" material lookup — can be cross-referenced

#### E. Seasonal & Climate Awareness
- Based on user's location and current date, determine what's in-season locally
- Out-of-season produce was either grown in an energy-intensive greenhouse or imported long-distance
- Apply appropriate transport and energy penalties
- "It's March in Ontario. This tomato was either greenhouse-grown or shipped from Mexico/California. Sustainability adjusted."

**Personalization Setup Flow:**
```
First launch → "Let's personalize your scores"
    → Enter postal code (auto-fills provincial grid, water stress, recycling, season data)
    → Select vehicle (dropdown: make/model/year from NRCan database, or "no car / transit / bike")
    → Optional: dietary restrictions, household size
    → "Your EcoLens is calibrated. Scores are now personal to you."
```

**The Pitch:**
"Two people scan the same box of pasta. One drives a Civic in Vancouver, the other drives an F-150 in Calgary. They get different scores, different costs, different recommendations. Because sustainability isn't one-size-fits-all."

---

### 3. True Cost Externality Pricing

**The Problem:**
The price on the shelf is a lie. It doesn't include the cost of carbon emissions, water depletion, plastic pollution, or ecosystem damage. These costs are real — they're just paid by everyone instead of the buyer.

**The Concept:**
For every product, calculate and display the **externalized cost** — the environmental damage that isn't reflected in the sticker price. Ground this in established economic models.

#### Externality Categories & Pricing Models

| Externality | Pricing Basis | Source |
|-------------|--------------|--------|
| Carbon emissions | Canada's federal carbon price: ~$110/tonne CO2e (2026), rising $15/year toward $170 by 2030 | ECCC Carbon Pricing |
| Water consumption | Local water scarcity premium: varies by region | ECCC Hydrometric Data + WRI Aqueduct |
| Plastic packaging | Estimated end-of-life cost: cleanup, landfill, ocean damage | Published studies on plastic externalities |
| Land use change | Deforestation/habitat loss cost per hectare converted | Academic environmental economics |
| Eutrophication (fertilizer runoff) | Downstream water treatment costs | ECCC Water Quality Monitoring Data |

#### How It's Calculated

1. **Gemini researches the product's lifecycle**: raw materials → manufacturing → transport → packaging → end-of-life
2. **Each lifecycle stage maps to externality categories**: e.g., beef production → high carbon (methane), high water, high land use
3. **Externalities are monetized using the pricing models above** — notably, Canada's own federal carbon price (~$110/tonne in 2026, legislated to rise to $170/tonne by 2030) provides a real, government-backed number rather than an academic estimate
4. **Hyperlocal adjustments applied** (Feature 2): water costs higher in Prairie drought areas, carbon costs adjusted for provincial grid, etc.
5. **Final output**: a dollar amount (CAD) added to the shelf price

#### Display Concept

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

#### Comparative View

When showing alternatives, the total cost reframes value:

```
Product A: $2.49 shelf → $3.66 total cost (sustainability: 61)
Product B: $3.29 shelf → $3.52 total cost (sustainability: 84)

"Product B costs $0.80 more at checkout but $0.14 LESS
 when you count what the planet pays."
```

**The Pitch:**
"Every product has two prices. The one you pay, and the one the planet pays. EcoLens shows you both."

---

### 4. AR Shelf Scanner

**The Problem:**
Scanning one product at a time is tedious. The real power move is scanning an entire shelf and seeing everything at once.

**The Concept:**
User points their phone camera at a store shelf. The app identifies multiple products simultaneously and overlays sustainability information in real-time.

#### Technical Flow

1. **Camera captures shelf image** → sent to Cloudinary for processing
2. **Cloudinary** handles:
   - Image enhancement and normalization
   - Object detection to isolate individual products on the shelf
   - OCR on visible labels, brand names, product names
   - Barcode detection if visible
3. **Product identification** → each detected item is sent to Gemini for identification and sustainability research
4. **Pricing** → each identified product is run through the pricing layers (Layer 1 for Loblaw products, Layer 2 for others) in parallel to fetch real shelf prices
5. **Overlay generation** → results returned and displayed as AR overlay on the camera feed:
   - Color-coded borders around each product (green / yellow / red)
   - Small score badge on each item
   - Tap any product for full breakdown

#### AR Overlay Design

```
Camera view of shelf:
┌─────────────────────────────────────────┐
│                                         │
│  ┌─GREEN──┐  ┌─RED────┐  ┌─YELLOW──┐   │
│  │        │  │        │  │         │   │
│  │ Brand  │  │ Brand  │  │ Brand   │   │
│  │   B    │  │   A    │  │   C     │   │
│  │        │  │        │  │         │   │
│  │  [91]  │  │  [34]  │  │  [67]   │   │
│  └────────┘  └────────┘  └─────────┘   │
│                                         │
│  ┌─GREEN──┐  ┌─YELLOW─┐  ┌─GREEN───┐   │
│  │ Brand  │  │ Brand  │  │ Brand   │   │
│  │   D    │  │   E    │  │   F     │   │
│  │  [88]  │  │  [59]  │  │  [85]   │   │
│  └────────┘  └────────┘  └─────────┘   │
│                                         │
│         [ Tap any product ]             │
│    [ "Best on this shelf: Brand B" ]    │
└─────────────────────────────────────────┘
```

#### Interaction Model

- **Passive view**: color-coded borders + score badges (visible at a glance)
- **Tap a product**: expands to full card with sustainability breakdown, total cost, and alternatives
- **"Best on Shelf" banner**: automatically highlights the top-scoring product
- **Sort toggle**: switch overlay between sustainability score, out-of-pocket cost, or value ratio
- **Snapshot mode**: freeze frame, save annotated image, share it

#### Performance Considerations

- Full analysis per shelf scan will take several seconds (Gemini API calls + pricing layer calls for each product)
- A shelf of 10 products could trigger 10 Layer 1 calls + up to 10 Layer 2 grounded searches — budget ~$0.14 in grounded search costs per full shelf scan
- Use a loading state: show products detected first (fast, Cloudinary only), then populate scores as they resolve (Gemini + pricing, async)
- Cache results — if a user scans the same shelf section twice, serve cached scores. Use 24-hour cache aligned with flyer cycles
- Batch Gemini sustainability calls where possible to minimize API usage (send multiple products in one prompt)

#### Progressive Enhancement

- **V1 (hackathon MVP)**: single photo → annotated result image (not live AR, just a processed photo with overlays). This is achievable in a weekend.
- **V2 (stretch)**: live camera feed with real-time overlay updates

**The Pitch:**
"Don't scan one product. Scan the whole shelf. See everything at once. Shop with your eyes open."

---

## Scoring Algorithm Summary

### Base Sustainability Score (0-100)

| Factor | Weight | Source |
|--------|--------|--------|
| Transport distance (origin → store → user) | 25% | Google Maps API + Gemini |
| Packaging (type, recyclability, local processing) | 20% | Cloudinary image analysis + Gemini |
| Certifications (organic, fair trade, B Corp, Canada Organic, etc.) | 20% | Open Food Facts API + Gemini |
| Brand ethics & labor transparency | 15% | Gemini research |
| Production method & resource intensity | 10% | Gemini research |
| End-of-life / recyclability in user's Canadian municipality | 10% | Gemini + ECCC data + hyperlocal context |

### Hyperlocal Adjustments

After base score calculation, apply multipliers:
- Water-intensive product + drought region → penalty
- Non-recyclable locally → packaging score drops
- Out-of-season produce → transport/energy penalty
- High-carbon provincial grid (e.g., Alberta) + electrically manufactured → production penalty

### Cost Terminology

To avoid confusion, three distinct cost figures are used throughout:
- **Out-of-Pocket Cost** = shelf price + gas cost to store (what you actually pay)
- **Externality Cost** = monetized environmental damage (carbon, water, packaging, transport — what society pays)
- **Total Cost** = out-of-pocket + externality (the full picture)

### Sorting Modes

1. **Best Sustainability (Green)**: sort by adjusted sustainability score descending
2. **Best Price (Budget)**: sort by out-of-pocket cost in CAD (shelf price + gas cost to store) ascending
3. **Best Sustainability-to-Price Ratio (Sweet Spot)**: sort by (sustainability score / total cost) descending — the recommended default
4. **Lowest Externality Cost (Planet Pick)**: sort by externality cost ascending — lowest real-world environmental damage in dollar terms

---

## API & Service Dependencies

### Core Services (Paid / Free Tier)
| Service | Purpose | Cost Model |
|---------|---------|------------|
| Gemini API (standard) | Product identification, sustainability research, score calculation, alternative discovery | Per-token |
| Gemini API (with Google Search Grounding) | Layer 2 pricing — live Google search for flyer deals, sale prices at non-Loblaw stores | ~$14 per 1,000 queries (free tier: 500-1,500/day) |
| PC Express Internal API | Layer 1 pricing — structured product data with real prices across all Loblaw banners | Free (unofficial/internal) |
| Cloudinary | Image processing, OCR, object detection, AR overlay generation | Free tier + usage |
| Google Maps Platform | Distance Matrix, Places API (nearby Canadian stores), Directions | Free tier + usage |

### Canadian Open Data (All Free)
| Service | Purpose | Access |
|---------|---------|--------|
| Open Food Facts API | Product database, eco-scores, nutrition, ingredients | REST API (JSON) |
| ECCC Grid Emission Intensity Factors | Provincial/territorial carbon intensity (gCO2eq/kWh) | CSV via open.canada.ca |
| High-Frequency Electricity Data (HFED) | Near-real-time generation mix, all 13 provinces/territories | JSON API via energy-information.canada.ca |
| ECCC Real-Time Hydrometric Data | Water levels and flow, 2,100+ stations | OGC API (GeoJSON) via api.weather.gc.ca |
| WRI Aqueduct Water Risk Atlas | Sub-basin water stress indices | GIS shapefiles (downloadable) |
| NRCan Fuel Consumption Ratings | Vehicle fuel consumption (L/100km), 1995-2026 | CSV via open.canada.ca |
| NRCan Gasoline Prices | Monthly gas prices (¢/litre) for 11 Canadian cities | CSV via CKAN API on open.canada.ca |
| Ontario Gasoline Report | Weekly gas prices for 10 Ontario markets | CSV via data.ontario.ca |
| Statistics Canada WDS API | Waste, energy, GHG, and price data tables | REST API (JSON/SDMX), 50 req/sec |
| Canada's Federal Carbon Price | Externality pricing (~$110/tonne CO2e in 2026, rising to $170 by 2030) | Public policy reference |
| ECCC AQHI | Real-time Air Quality Health Index by station | OGC API (GeoJSON) via api.weather.gc.ca |
| NPRI | Facility-level pollutant releases across Canada | CSV/XLSX via open.canada.ca |

---

## Differentiators vs Existing Apps

| Feature | Yuka | Good On You | Think Dirty | **EcoLens** |
|---------|------|-------------|-------------|-------------|
| Product scanning | Single item | Brand only | Single item | **Receipt + shelf + single** |
| Sustainability score | Generic | Generic | Generic | **Hyperlocal & personalized** |
| Price consideration | No | No | No | **Total cost with externalities** |
| Distance/gas factored | No | No | No | **Yes, per your vehicle** |
| Local recycling awareness | No | No | No | **Yes, by municipality** |
| Water stress adjustment | No | No | No | **Yes, by region** |
| Energy grid awareness | No | No | No | **Yes, by postal code** |
| Seasonal adjustment | No | No | No | **Yes, by location + date** |
| Externality pricing | No | No | No | **Yes, $ amount** |
| AR multi-product scan | No | No | No | **Yes** |
| Retroactive receipt analysis | No | No | No | **Yes** |

---

## Open Design Questions

- **Onboarding friction vs personalization depth**: how much do we ask upfront vs infer over time?
- **Gemini rate limiting**: how do we handle a shelf scan that triggers 15+ Gemini calls simultaneously? Batch calls + cache aggressively
- **PC Express API stability**: this is an unofficial internal API — API keys may rotate, endpoints may change. Need a monitoring/fallback strategy
- **Non-Loblaw store coverage**: Layer 2 (grounded search) won't find prices for every product at every store. How prominently do we show "price unavailable" vs hiding those stores?
- **Caching strategy**: how long do we cache Layer 1 and Layer 2 prices? Prices change weekly (flyer cycles). Suggested: 24-hour cache for Layer 1, 48-hour for Layer 2
- **Offline capability**: should any scoring work offline with cached data?
- **Gamification**: carbon wallet with budgets and streaks — include in MVP or defer?
- **Social features**: neighbourhood comparisons, shareable sustainability receipts — include in MVP or defer?
