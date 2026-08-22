import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import NewsList from "@/components/NewsList";

export const metadata: Metadata = {
  title: "News — Al Adrak",
  description:
    "News, milestones and awards from Al Adrak Trading & Contracting — Oman's most established construction company.",
};

export default function NewsPage() {
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      <section className="relative pt-40 pb-16 md:pt-52 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-poster.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />
        </div>
        <div className="relative shell">
          <Reveal>
            <p className="label text-gold mb-6">Newsroom</p>
            <h1 className="font-display text-cream text-5xl md:text-7xl leading-[1.02]">
              Milestones &amp; moments
            </h1>
            <p className="font-serifit italic text-cream/80 text-xl md:text-2xl mt-6 max-w-xl">
              Partnerships signed, landmarks delivered, awards received — the
              Adrak story as it unfolds.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-parchment rounded-t-[2.5rem] md:rounded-t-[4rem]">
        <div className="shell py-16 md:py-24">
          <NewsList />
        </div>
      </section>

      <Footer />
    </main>
  );
}
