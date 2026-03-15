# EcoLens

**Know the real price of what you buy.**

EcoLens is a sustainability scanner built for Canadian shoppers. Scan a product, upload a receipt, or point your camera at a grocery shelf and instantly see the full picture: what it costs you, what it costs the planet, and what better options are nearby.

No jargon. No arbitrary green scores. Just honest numbers.

---

## What You Can Do

### Scan a Product
Point your camera at any barcode or product label. EcoLens identifies what it is, finds its real price across nearby stores, and gives it a sustainability score from 0 to 100. You also get the **true cost**: the shelf price plus the environmental damage priced in actual dollars.

### Compare Alternatives
Once a product is scanned, EcoLens finds greener or cheaper alternatives in the same category. Sort them four ways to find what matters to you:

- **Greenest** -- the most sustainable option, no compromises
- **Cheapest** -- lowest shelf price including the gas it costs to get there
- **Sweet Spot** -- the best balance of sustainability and price (this is the one we recommend)
- **Planet Pick** -- whichever product does the least environmental damage in dollar terms

### Upload a Receipt
Take a photo of any Loblaws, No Frills, or Real Canadian Superstore receipt and EcoLens analyses your entire basket. It flags your highest-impact items and suggests swaps that are better for your wallet and the environment.


---

## It's Personal to You

EcoLens is not a generic green score. The numbers change based on who you are and where you live.

When you first open the app, it asks for two things: your **postal code** and your **vehicle**. That's it.

- Living in Quebec? Your electricity-related scores are much better than in Alberta, because Quebec's grid runs almost entirely on hydropower.
- The gas cost to reach a store is calculated using your specific car's fuel efficiency, not a rough estimate.
- Seasonal produce scores higher when it's actually in season in your province.
- Packaging scores reflect whether your city's recycling program can actually handle the material.

The same product can look very different depending on where you are. That's the point.

---

## How the True Cost Works

Every product gets three numbers:

| | What it means |
|-|---------------|
| **Shelf Price** | What the store charges |
| **Gas Cost** | What it costs to drive there, based on your car and the distance |
| **Externality Cost** | The environmental damage (carbon, water, packaging, land use) priced in CAD |

Add them together and you get the **True Cost**: what the product actually costs you and the world.

Carbon costs are based on Canada's published social cost of carbon. Water, packaging, and land use costs come from peer-reviewed environmental research. These are not made-up points. They are real numbers with real sources behind them.

> EcoLens never guesses prices. If a verified price cannot be found, it shows as unavailable. Every number you see has a source.

---

## Built With

### Tech Stack

| | |
|-|-|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Frontend** | React 19, TypeScript 5, Tailwind CSS 4 |
| **Deployment** | Vercel |

### APIs and Services

| | |
|-|-|
| **Google Gemini 2.0 Flash** | Product identification, sustainability research, lifecycle analysis, real-time grounded pricing, fuzzy receipt matching, shelf batch identification |
| **Cloudinary** | Barcode detection, label OCR, receipt text extraction, multi-product shelf detection |
| **Open Food Facts** | Public product database, eco-scores, ingredient and packaging data |
| **PC Express (Loblaw)** | Verified live prices across Loblaws, No Frills, Real Canadian Superstore, Shoppers Drug Mart, and Zehrs |
| **Google Maps Platform** | Driving distance to stores, postal code geocoding |
| **NRCan Open Data** | Official Canadian vehicle fuel efficiency database for personalised gas cost calculations |

---

## Tips for Getting the Most Out of It

- **Set up your profile first.** The onboarding only takes a minute and it makes every score and cost you see accurate to your life. Skip it and you get generic numbers.
- **Try the Sweet Spot sort.** The greenest option is not always worth the premium. Sweet Spot finds where the score and price actually line up well.
- **Scan receipts after a big grocery run.** It's the fastest way to spot patterns in your shopping and find the one or two swaps that make the biggest difference.
- **Use the shelf scanner in the pasta or cereal aisle.** These categories have the most alternatives and the widest range of scores, so the overlay is most useful there.

---

## Frequently Asked Questions

**Does it work outside Canada?**
Not yet. The pricing data, grid emissions, seasonal produce calendars, and recycling program data are all Canadian. Expanding to other countries is on the roadmap.

**How accurate are the sustainability scores?**
Each score is built from real data: Open Food Facts eco-scores, Gemini-researched sourcing and certifications, and hyperlocal adjustments for your province. They are not perfect, but they are grounded in real sources rather than guesses.

**Why does the same product score differently in two cities?**
Because the infrastructure is different. A product with recyclable packaging scores better in a city that actually recycles it. A product that requires refrigeration scores better where the electricity grid is cleaner.

**What if a price is missing?**
It shows as unavailable. EcoLens does not fabricate prices under any circumstances.
