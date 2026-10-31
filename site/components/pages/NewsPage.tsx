"use client";
import { useText } from "@/lib/translate-client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import NewsList from "@/components/NewsList";
import { asset } from "@/lib/asset";



export default function NewsPage() {
  const textForLocale = useText();
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      <PageHero
        img={asset("/images/hero-poster.jpg")}
        alt={textForLocale("Al Adrak's Halban campus from the air — warehouses, yard and the city beyond")}
        kicker={textForLocale("Newsroom")}
        title={<>{textForLocale("Milestones & moments")}</>}
      >
        <p className="font-serifit italic text-cream/80 text-xl md:text-2xl mt-6 max-w-xl">
          {textForLocale("Partnerships signed, landmarks delivered, awards received — the Adrak story as it unfolds.")}</p>
      </PageHero>

      <section className="relative bg-parchment rounded-t-[2.5rem] md:rounded-t-[4rem]">
        <div className="shell py-16 md:py-24">
          <NewsList />
        </div>
      </section>

      <Footer />
    </main>
  );
}
