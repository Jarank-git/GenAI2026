"use client";

import { useState } from "react";
import Link from "next/link";

function getStoredCity(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("ecolens-profile");
    if (stored) {
      const profile = JSON.parse(stored);
      return profile.city ?? null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export default function Home() {
  const [profileCity] = useState<string | null>(getStoredCity);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="text-display text-2xl tracking-tight text-foreground">
            EcoLens
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-light tracking-wide text-muted transition-colors hover:text-foreground">
              About
            </a>
            <a href="#features" className="text-sm font-light tracking-wide text-muted transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#explore" className="text-sm font-light tracking-wide text-muted transition-colors hover:text-foreground">
              Explore
            </a>
            <Link href="/scan" className="btn-primary text-xs">
              Get Started
            </Link>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm font-light tracking-widest text-muted md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="animate-fade-in border-t border-border bg-background/95 px-6 py-6 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#about" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">About</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">Features</a>
              <a href="#explore" onClick={() => setMenuOpen(false)} className="text-editorial text-2xl text-foreground">Explore</a>
              <div className="my-2 h-px bg-border" />
              <Link href="/scan" className="btn-primary w-full text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6">
        {/* Atmospheric gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-light/30 via-background to-background" />
        <div className="absolute top-0 right-0 h-[60vh] w-[60vw] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[40vh] w-[40vw] rounded-full bg-earth/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="section-label animate-fade-up mb-6">
            Sustainability, Reimagined
          </p>
          <h1 className="text-display animate-fade-up delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            The <em className="text-accent">True Cost</em>
            <br />
            of What You Buy
          </h1>
          <p className="animate-fade-up delay-2 mx-auto mt-8 max-w-lg text-base font-light leading-relaxed text-muted sm:text-lg">
            Environmental, ethical, and financial impact — personalized
            to your location and circumstances across Canada.
          </p>
          <div className="animate-fade-up delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/scan" className="btn-primary px-8 py-4 text-sm">
              Scan a Product
            </Link>
            <a href="#about" className="btn-secondary px-8 py-4 text-sm">
              Learn More
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in delay-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[0.625rem] font-light tracking-[0.2em] uppercase text-muted/50">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-muted/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────── */}
      <section id="about" className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-2 md:gap-20">
            {/* Left column */}
            <div>
              <p className="section-label mb-4">About EcoLens</p>
              <div className="flex flex-col gap-5 text-sm text-muted">
                <div className="flex items-start gap-4">
                  <span className="text-editorial text-lg text-accent">01.</span>
                  <p className="font-light leading-relaxed">Reveals the hidden environmental price behind every grocery product on Canadian shelves</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-editorial text-lg text-accent">02.</span>
                  <p className="font-light leading-relaxed">Personalizes sustainability scores to your postal code, vehicle, and household</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-editorial text-lg text-accent">03.</span>
                  <p className="font-light leading-relaxed">Calculates true cost including carbon, water, packaging, and land-use externalities</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col justify-center">
              <p className="text-editorial text-xl leading-relaxed text-foreground sm:text-2xl md:text-3xl">
                By combining <em>environmental science</em> with real-time pricing data,
                EcoLens makes it easy to see the full picture — the cost to your wallet
                <em> and</em> the cost to the planet.
              </p>
              <Link href="/onboarding" className="btn-primary mt-8 w-fit">
                {profileCity ? `Your Profile: ${profileCity}` : "Set Up Your Profile"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-border" />
      </div>

      {/* ── Features ───────────────────────────────────── */}
      <section id="features" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl">
            <p className="section-label mb-4">Features</p>
            <h2 className="text-display text-4xl sm:text-5xl">
              Tools That <em className="text-accent">Illuminate</em> Impact
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              number="01"
              title="Product Scanner"
              description="Snap a photo of any product to instantly identify it and reveal its sustainability profile with real-time AI analysis."
              href="/scan"
            />
            <FeatureCard
              number="02"
              title="True Cost Breakdown"
              description="See beyond the price tag — carbon emissions, water usage, packaging waste, and land use monetized into real dollar amounts."
              href="/demo"
            />
            <FeatureCard
              number="03"
              title="Smart Comparisons"
              description="Four sorting modes help you find the greenest, cheapest, or best value-to-sustainability ratio alternatives."
              href="/demo"
            />
            <FeatureCard
              number="04"
              title="Receipt Analysis"
              description="Upload a grocery receipt to analyze every item and get personalized swap recommendations for a greener basket."
              href="/receipt"
            />
            <FeatureCard
              number="05"
              title="Shelf Scanner"
              description="Point your camera at an entire shelf to compare products side-by-side with sustainability overlays."
              href="/shelf"
            />
            <FeatureCard
              number="06"
              title="Hyperlocal Context"
              description="Your postal code, vehicle type, and local grid intensity all factor into personalized impact calculations."
              href="/onboarding"
            />
          </div>
        </div>
      </section>

      {/* ── Explore / CTA ──────────────────────────────── */}
      <section id="explore" className="relative overflow-hidden bg-surface-dark px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-earth/5" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl">
            <p className="section-label mb-4 text-accent-light/60">Explore</p>
            <h2 className="text-display text-4xl text-white/90 sm:text-5xl">
              Start Your <em className="text-accent-light">Journey</em> Today
            </h2>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-white/40">
              Every scan reveals a story. Every choice shapes a future. See what&apos;s really behind the products you buy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ExploreCard
              title="Scan Product"
              subtitle="Identify & analyze"
              href="/scan"
              accent
            />
            <ExploreCard
              title="View Demo"
              subtitle="See it in action"
              href="/demo"
            />
            <ExploreCard
              title="Scan Receipt"
              subtitle="Analyze a grocery trip"
              href="/receipt"
            />
            <ExploreCard
              title="Scan Shelf"
              subtitle="Compare entire shelves"
              href="/shelf"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-surface-dark px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-display text-3xl text-white/80">EcoLens</p>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-white/30">
                Canadian-focused sustainability intelligence.
                The true cost of what you buy — environmental,
                ethical, and financial.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/scan" className="text-sm font-light text-white/40 transition-colors hover:text-white/70">Scan</Link>
              <Link href="/demo" className="text-sm font-light text-white/40 transition-colors hover:text-white/70">Demo</Link>
              <Link href="/receipt" className="text-sm font-light text-white/40 transition-colors hover:text-white/70">Receipt</Link>
              <Link href="/shelf" className="text-sm font-light text-white/40 transition-colors hover:text-white/70">Shelf</Link>
              <Link href="/onboarding" className="text-sm font-light text-white/40 transition-colors hover:text-white/70">Profile</Link>
            </div>
          </div>
          <div className="mt-10 h-px bg-white/10" />
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-light text-white/20">
              Built for Canadian sustainability
            </p>
            <p className="text-xs font-light text-white/20">
              EcoLens &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function FeatureCard({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group eco-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-editorial text-sm text-accent">{number}.</span>
        <svg
          className="h-4 w-4 text-muted/40 transition-all group-hover:translate-x-1 group-hover:text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </div>
      <h3 className="text-editorial text-xl text-foreground">{title}</h3>
      <p className="text-sm font-light leading-relaxed text-muted">{description}</p>
    </Link>
  );
}

function ExploreCard({
  title,
  subtitle,
  href,
  accent,
}: {
  title: string;
  subtitle: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
        accent
          ? "border-accent/30 bg-accent/10 hover:border-accent/50 hover:bg-accent/15"
          : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
      }`}
      style={{ minHeight: "140px" }}
    >
      <p className={`text-xs font-light tracking-wider ${accent ? "text-accent-light/60" : "text-white/30"}`}>
        {subtitle}
      </p>
      <div className="flex items-end justify-between">
        <h3 className={`text-editorial text-xl ${accent ? "text-accent-light" : "text-white/70"}`}>
          {title}
        </h3>
        <svg
          className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${accent ? "text-accent-light/40" : "text-white/20"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </Link>
  );
}
