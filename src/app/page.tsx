"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

function getStoredCity(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("ecolens-profile");
    if (stored) {
      const profile = JSON.parse(stored);
      return profile.city ?? null;
    }
  } catch { }
  return null;
}

// Scroll-triggered reveal hook
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

const TICKER_ITEMS = [
  "Carbon Emissions", "Water Consumption", "Packaging Waste", "Land Use",
  "Grid Intensity", "Transport Cost", "Recycling Rates", "Seasonal Impact",
  "Carbon Emissions", "Water Consumption", "Packaging Waste", "Land Use",
  "Grid Intensity", "Transport Cost", "Recycling Rates", "Seasonal Impact",
];

const FEATURES = [
  {
    number: "01",
    title: "Product Scanner",
    description: "Snap a barcode or label. EcoLens identifies the product, scores its sustainability, and breaks down every hidden cost personalized to your province and lifestyle.",
    href: "/scan",
  },
  {
    number: "02",
    title: "True Cost Breakdown",
    description: "Carbon, water, packaging, and land use each priced in CAD using peer-reviewed Canadian environmental data.",
    href: "/demo",
  },
  {
    number: "03",
    title: "Smart Comparisons",
    description: "Sort alternatives four ways: greenest, cheapest, best value ratio, or lowest environmental damage.",
    href: "/demo",
  },
  {
    number: "04",
    title: "Receipt Analysis",
    description: "Upload a grocery receipt and get a full sustainability breakdown of your entire basket at once.",
    href: "/receipt",
  },
  {
    number: "05",
    title: "Hyperlocal Context",
    description: "Your postal code, vehicle, and city recycling programs all factor into every number you see.",
    href: "/onboarding",
  },
];

export default function Home() {
  const [profileCity] = useState<string | null>(getStoredCity);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reveal refs for each section
  const [approachRef, approachVisible] = useReveal();
  const [stepsRef, stepsVisible] = useReveal();
  const [featuresRef, featuresVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ── */}
      <nav className="relative z-50 px-6 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-border py-6">
          <Link href="/" className="text-display text-xl tracking-tight text-foreground transition-opacity duration-200 hover:opacity-70">
            EcoLens
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <Link href="/onboarding" className="nav-link">
              {profileCity ? profileCity : "Set Location"}
            </Link>
            <Link href="/scan" className="btn-primary">Scan a Product</Link>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[0.65rem] tracking-widest uppercase text-muted transition-colors duration-200 hover:text-foreground md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        {menuOpen && (
          <div className="animate-fade-in border-b border-border bg-background px-6 py-6 md:hidden">
            <div className="flex flex-col gap-5">
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">How It Works</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">Features</a>
              <Link href="/onboarding" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">
                {profileCity ?? "Set Location"}
              </Link>
              <div className="my-1 h-px bg-border" />
              <Link href="/scan" className="btn-primary w-full text-center">Scan a Product</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-end gap-16 md:grid-cols-[1fr_200px] md:gap-24">
            <div>
              <p className="section-label mb-8 animate-fade-up">Canadian Sustainability Intelligence</p>
              <h1 className="text-display hero-headline animate-fade-up delay-1">
                Every product<br />
                carries a hidden<br />
                <em className="text-accent">price tag.</em>
              </h1>
              <p className="mt-8 max-w-md text-base font-light leading-relaxed text-muted animate-fade-up delay-2">
                EcoLens reveals the full cost of what you buy — carbon, water, packaging, and land use — priced in real dollars and personalized to where you live in Canada.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-3">
                <Link href="/scan" className="btn-primary">Scan a Product</Link>
                <a href="#how-it-works" className="btn-secondary">How It Works</a>
              </div>
            </div>
            <div className="hidden flex-col gap-0 pb-1 md:flex animate-fade-up delay-2">
              <StatCallout value="~$190" label="CAD per tonne CO₂" />
              <StatCallout value="77×" label="grid emissions spread" />
              <StatCallout value="3" label="pricing layers" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-container overflow-hidden border-y border-border bg-card py-3">
        <div className="ticker-track flex whitespace-nowrap">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="px-6 text-[0.65rem] uppercase tracking-widest text-muted">
              {item}<span className="mx-3 text-accent">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Approach ── */}
      <section
        ref={approachRef as React.RefObject<HTMLElement>}
        className={`border-b border-border px-6 py-20 md:px-10 md:py-28 reveal ${approachVisible ? "is-visible" : ""}`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[180px_1fr]">
            <div className="pt-1">
              <p className="section-label">Our Approach</p>
            </div>
            <div>
              <p className={`pull-quote text-foreground ${approachVisible ? "is-visible" : ""}`}>
                Most sustainability apps give you a score.<br />
                EcoLens gives you <em>the math</em> — numbers built on peer-reviewed science, adjusted to your life.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                <div className={`reveal ${approachVisible ? "is-visible reveal-delay-1" : ""}`}>
                  <p className="text-display tabular text-3xl text-accent">5</p>
                  <p className="mt-1 text-xs font-light leading-snug text-muted">externality cost calculators</p>
                </div>
                <div className={`reveal ${approachVisible ? "is-visible reveal-delay-2" : ""}`}>
                  <p className="text-display tabular text-3xl text-accent">7</p>
                  <p className="mt-1 text-xs font-light leading-snug text-muted">hyperlocal dimensions</p>
                </div>
                <div className={`reveal ${approachVisible ? "is-visible reveal-delay-3" : ""}`}>
                  <p className="text-display tabular text-3xl text-accent">3</p>
                  <p className="mt-1 text-xs font-light leading-snug text-muted">pricing layers, always sourced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        ref={stepsRef as React.RefObject<HTMLElement>}
        className={`border-b border-border px-6 py-20 md:px-10 md:py-28 reveal ${stepsVisible ? "is-visible" : ""}`}
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-label mb-16">How It Works</p>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {[
              { n: "01", title: "Scan the product", body: "Point your camera at a barcode or label. We identify it instantly using Gemini AI and Cloudinary image processing." },
              { n: "02", title: "We fetch real prices", body: "Three layers pull verified prices from Loblaw banners, live web sources, and retailer pages. If a price cannot be found, we say so." },
              { n: "03", title: "We calculate the true cost", body: "Carbon, water, packaging, and land use are each converted to a dollar amount using Canadian environmental research. Your province and vehicle factor in." },
              { n: "04", title: "You decide with full information", body: "Sort alternatives four ways. Greenest, cheapest, best value ratio, or lowest environmental damage. The choice is yours." },
            ].map((s, i) => (
              <div
                key={s.n}
                className={`border-t border-border py-10 pr-0 md:pr-16 reveal ${stepsVisible ? `is-visible reveal-delay-${i + 1}` : ""}`}
              >
                <span className="text-[0.65rem] uppercase tracking-widest text-muted">{s.n}</span>
                <h3 className="text-editorial mt-3 mb-3 text-2xl text-foreground">{s.title}</h3>
                <p className="max-w-[45ch] text-sm font-light leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        ref={featuresRef as React.RefObject<HTMLElement>}
        className={`border-b border-border px-6 py-20 md:px-10 md:py-28 reveal ${featuresVisible ? "is-visible" : ""}`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-end justify-between border-b border-border pb-6">
            <p className="section-label">Features</p>
            <Link href="/demo" className="nav-link">View Demo →</Link>
          </div>
          {FEATURES.map((f, i) => (
            <Link
              key={f.number}
              href={f.href}
              className={`feature-row-link group grid grid-cols-[48px_1fr_24px] items-center gap-6 border-b border-border py-6 md:grid-cols-[64px_1fr_24px] reveal ${featuresVisible ? `is-visible reveal-delay-${Math.min(i + 1, 3)}` : ""}`}
            >
              <span className="text-[0.65rem] uppercase tracking-widest text-muted pt-0.5 transition-colors duration-200 group-hover:text-accent">{f.number}</span>
              <div>
                <h3 className="text-editorial text-xl text-foreground transition-colors duration-200 group-hover:text-accent">{f.title}</h3>
                <p className="mt-1 text-sm font-light leading-relaxed text-muted max-w-[60ch]">{f.description}</p>
              </div>
              <svg
                className="h-4 w-4 text-muted/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef as React.RefObject<HTMLElement>}
        className={`px-6 py-20 md:px-10 md:py-28 reveal ${ctaVisible ? "is-visible" : ""}`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <p className="section-label mb-6">Get Started</p>
              <h2 className="text-display cta-headline">
                See what your groceries<br />
                <em className="text-accent">actually cost.</em>
              </h2>
            </div>
            <div className="flex flex-col gap-5 md:items-end md:text-right">
              <p className="max-w-sm text-sm font-light leading-relaxed text-muted">
                Set up your profile with your postal code and vehicle. Every score and cost you see will be grounded in your actual life.
              </p>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link href="/onboarding" className="btn-primary">
                  {profileCity ? `Profile: ${profileCity}` : "Set Up Your Profile"}
                </Link>
                <Link href="/scan" className="btn-secondary">Scan Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-10 md:px-10">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-display text-xl text-foreground">EcoLens</p>
            <p className="mt-1 text-xs font-light text-muted">Canadian sustainability intelligence</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/scan" className="nav-link">Scan</Link>
            <Link href="/receipt" className="nav-link">Receipt</Link>
            <Link href="/demo" className="nav-link">Demo</Link>
            <Link href="/onboarding" className="nav-link">Profile</Link>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} EcoLens</p>
        </div>
      </footer>

    </div>
  );
}

function StatCallout({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-callout border-t border-border pt-5 pb-5 last:pb-0">
      <p className="text-display tabular text-2xl text-foreground">{value}</p>
      <p className="mt-1 max-w-[14ch] text-xs font-light leading-snug text-muted">{label}</p>
    </div>
  );
}
