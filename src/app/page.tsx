"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [profileCity, setProfileCity] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ecolens-profile");
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.city) setProfileCity(profile.city);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-6">
      <main className="flex w-full max-w-md flex-col items-center gap-8 pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            EcoLens
          </h1>
          <p className="mt-3 text-base text-gray-500">
            The true cost of what you buy — environmental, ethical, and
            financial — personalized to your life.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/scan"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl">
              {"\u{1F4F7}"}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Scan a Product</p>
              <p className="text-xs text-gray-500">
                Take a photo to see the true cost
              </p>
            </div>
          </Link>

          <Link
            href="/onboarding"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xl">
              {"\u{1F464}"}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Set Up Profile</p>
              <p className="text-xs text-gray-500">
                {profileCity
                  ? `Profile: ${profileCity}`
                  : "Personalize results to your location"}
              </p>
            </div>
          </Link>

          <Link
            href="/receipt"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-xl">
              {"\u{1F9FE}"}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Scan Receipt</p>
              <p className="text-xs text-gray-500">
                Analyze your grocery trip sustainability
              </p>
            </div>
          </Link>

          <Link
            href="/shelf"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-xl">
              {"\u{1F6D2}"}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Scan Shelf</p>
              <p className="text-xs text-gray-500">
                Analyze an entire shelf at a glance
              </p>
            </div>
          </Link>

          <Link
            href="/demo"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl">
              {"\u{1F50D}"}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">View Demo</p>
              <p className="text-xs text-gray-500">
                Explore sorting modes with sample data
              </p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Canadian-focused sustainability insights
        </p>
      </main>
    </div>
  );
}
