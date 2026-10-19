import type { Metadata } from "next";
import { Marcellus, Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CursorFX from "@/components/CursorFX";
import PremiumFX from "@/components/PremiumFX";
import IntroLoader from "@/components/IntroLoader";
import { years } from "@/lib/anniversary";
import SiteAssistant from "@/components/SiteAssistant";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const space = Space_Grotesk({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Al Adrak — Legacy of Landmarks",
  description:
    `Al Adrak Trading & Contracting — Oman's most established engineering & construction contractor. ${years()} years, 450+ landmark projects, 100% in-house capability.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
          A safety net for a browser that cannot run this site's scripts.

          The page's HTML carries the loading screen, which covers everything, and about ninety
          elements that wait, hidden, for a script to reveal them. With working scripts that is the
          intended entrance. Without them — a phone too old to parse the bundle, a script blocked by a
          filter, a connection that drops half-way through — the visitor would be left looking at the
          loading screen for ever.

          So: a few ES5 lines that run in any browser. If the app has not announced itself
          (window.__adrakBooted, set the moment SmoothScroll mounts) within nine seconds, the root
          gets .js-failed and globals.css lifts the cover and shows the content. If the app starts
          late, it takes the class off again. The nine seconds are longer than the loading screen
          ever runs (its own ceiling is eleven, but the app is up and has announced itself within
          the first second).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "setTimeout(function(){if(!window.__adrakBooted){document.documentElement.className+=' js-failed'}},9000)",
          }}
        />
        <noscript>
          <style>{`.intro-root{display:none!important}[style*="opacity:0"],[style*="visibility:hidden"]{opacity:1!important;visibility:visible!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body
        className={`${marcellus.variable} ${cormorant.variable} ${space.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
        <CursorFX />
        <PremiumFX />
        <IntroLoader />
        <SiteAssistant />
      </body>
    </html>
  );
}
