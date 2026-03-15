import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoLens — The True Cost of What You Buy",
  description:
    "A Canadian-focused sustainability app that reveals the hidden price tag on every product: environmental, ethical, and financial — personalized to your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
