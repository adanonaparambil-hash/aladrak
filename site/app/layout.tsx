import type { Metadata } from "next";
import { Marcellus, Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CursorFX from "@/components/CursorFX";
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
      <body
        className={`${marcellus.variable} ${cormorant.variable} ${space.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
        <CursorFX />
        <IntroLoader />
        <SiteAssistant />
      </body>
    </html>
  );
}
