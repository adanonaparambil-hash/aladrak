import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import NewsList from "@/components/NewsList";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "News — Al Adrak",
  description:
    "News, milestones and awards from Al Adrak Trading & Contracting — Oman's most established construction company.",
};

export default function NewsPage() {
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      <PageHero
        img={asset("/images/hero-poster.jpg")}
        alt="An Al Adrak landmark at dusk"
        kicker="Newsroom"
        title={<>Milestones &amp; moments</>}
      >
        <p className="font-serifit italic text-cream/80 text-xl md:text-2xl mt-6 max-w-xl">
          Partnerships signed, landmarks delivered, awards received — the Adrak
          story as it unfolds.
        </p>
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
