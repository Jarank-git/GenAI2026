# EcoLens

> A Canadian-focused sustainability scanner that reveals the true cost of grocery products — environmental, ethical, and financial — personalized to your location and circumstances.

Point your camera at any product, receipt, or grocery shelf and EcoLens shows you what you actually pay: the shelf price, the gas to get there, and the environmental damage priced in dollars.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Runtime | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Deployment | Vercel |

---

## APIs & Services

### Google Gemini 2.0 Flash
Used throughout the entire pipeline:
- **Product identification** from barcode scans and label photos
- **Sustainability research** — sourcing, certifications, brand practices, packaging
- **Grounded-search pricing** — pulls real shelf prices from live web sources with citation URLs (never fabricates prices)
- **Lifecycle analysis** — carbon, water, and land use data per product
- **Fuzzy receipt matching** — maps messy receipt line items to real product names
- **Shelf batch identification** — identifies multiple products from a single shelf photo

### Cloudinary
Handles all image processing before data reaches Gemini:
- **Image upload** via Cloudinary REST API
- **Barcode detection** via Cloudinary Analyze API
- **Label OCR** — reads text from product labels
- **Receipt OCR** — extracts line items from grocery receipt photos
- **Multi-product shelf detection** — bounding boxes for AR overlay

### Open Food Facts
Free public API, no key required:
- Product database lookup by barcode
- Eco-scores and ingredient data
- Packaging and nutrition enrichment

### PC Express API (Loblaw)
- Layer 1 pricing: verified real-time prices across all Loblaw banners
- Covers Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, Zehrs

### Google Maps Platform
- Driving distance from user location to each store (Distance Matrix API)
- Geocoding from Canadian postal codes

### NRCan Open Data (Static)
- Vehicle fuel efficiency database used for gas cost calculations
- No API call needed — bundled as `nrcan-vehicles.json`

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 01 | Product Scanning | Identify any product from a barcode or label photo |
| 02 | Multi-Layer Pricing | Real prices from PC Express, grounded search, and retailer pages |
| 03 | Sustainability Scoring | 0–100 score adjusted for your province and lifestyle |
| 04 | Four Sorting Modes | Sort alternatives by price, sustainability, true cost, or value ratio |
| 05 | Hyperlocal Context | Personalized to your grid, vehicle, water region, and city recycling |
| 06 | Externality Pricing | Carbon + water + packaging + land use priced in CAD |
| 07 | Receipt Scanning | Upload a receipt, get a full basket sustainability analysis |
| 08 | AR Shelf Scanner | Point at a shelf and see scores overlaid across every product |

---

## How the True Cost is Calculated

```
Total Cost = Shelf Price + Gas Cost to Store + Externality Cost

Externality Cost = Carbon Cost + Water Cost + Packaging Cost + Land Use Cost
```

Carbon pricing uses Canada's published social cost of carbon (~$190 CAD/tonne CO2).
All other externality values are derived from peer-reviewed environmental economics literature.

Scores and costs adjust based on your location:
- **Grid emissions** — Quebec hydro vs. Alberta coal changes electricity-related scores significantly
- **Vehicle** — your car's fuel efficiency from the NRCan database feeds into gas cost
- **Water stress** — regional water scarcity multiplies the water externality cost
- **Seasonal produce** — in-season local produce scores higher than imported equivalents
- **Recycling programs** — your city's actual recycling rates affect packaging cost calculations

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Jarank-git/GenAI2026.git
cd GenAI2026
npm install
```

### Environment Variables

Copy the example file and fill in your API keys:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `GOOGLE_MAPS_API_KEY` | No | Falls back to postal code prefix lookup |
| `PC_EXPRESS_API_KEY` | No | Falls back to mock pricing |

> All features work in demo mode without API keys. Mock data with realistic Canadian products and prices is used as a fallback.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — links to all features, shows your saved city |
| `/onboarding` | Set up your profile (postal code + vehicle) |
| `/scan` | Scan a product barcode or label |
| `/receipt` | Upload a grocery receipt for basket analysis |
| `/shelf` | AR shelf scanner |
| `/demo` | Browse sorting modes with sample products |

---

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components by feature
├── services/         # API clients and business logic
├── orchestrators/    # Pipeline coordinators
├── types/            # Shared TypeScript types
├── data/             # Static datasets and mock data
└── lib/              # Utilities
```

---

## Deployment

Push to `main` and Vercel auto-deploys. No configuration needed — Next.js is auto-detected.

Make sure all required environment variables are set in your Vercel project settings before deploying.
