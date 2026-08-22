import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { careers, lifeAtAdrak, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Careers — Al Adrak",
  description:
    "Build the next landmark with Oman's most established contractor. Current openings at Al Adrak Trading & Contracting.",
};

export default function CareersPage() {
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      {/* Hero band */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/life/life-briefing.jpg"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />
        </div>
        <div className="relative shell">
          <Reveal>
            <p className="label text-gold mb-6">Careers at Al Adrak</p>
            <h1 className="font-display text-cream text-5xl md:text-7xl leading-[1.02] max-w-3xl">
              Build the next landmark with us
            </h1>
            <p className="font-serifit italic text-cream/80 text-xl md:text-2xl mt-8 max-w-xl">
              {lifeAtAdrak.statement}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Openings */}
      <section className="relative bg-cream text-ink rounded-t-[2.5rem] md:rounded-t-[4rem]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal className="mb-14">
            <p className="label text-brand mb-4">Current Openings</p>
            <h2 className="font-display text-4xl md:text-5xl">
              Five ways to join Team Adrak
            </h2>
          </Reveal>

          <div className="space-y-5">
            {careers.map((c, i) => (
              <Reveal key={c.role} delay={i * 0.06} tilt>
                <article className="group rounded-3xl bg-white/60 backdrop-blur-xl border border-ink/10 p-8 md:p-10 hover:border-gold/60 hover:shadow-[0_24px_60px_rgba(16,39,26,0.12)] transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-2xl md:text-3xl">
                          {c.role}
                        </h3>
                        <span className="px-4 py-1.5 bg-forest text-cream rounded-full label label-xs">
                          {c.exp}
                        </span>
                      </div>
                      <p className="text-taupe font-light leading-relaxed mt-4">
                        {c.desc}
                      </p>
                      <p className="label text-brand mt-5">{c.qual}</p>
                    </div>
                    <a
                      href={`mailto:${site.email}?subject=Application: ${encodeURIComponent(c.role)}`}
                      className="flex-none px-9 py-4 bg-gold text-ink rounded-full label font-bold hover:shadow-[0_0_28px_rgba(201,155,69,0.45)] transition-shadow duration-500 self-start"
                    >
                      Apply Now
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 text-center">
            <p className="font-serifit italic text-xl text-ink/70">
              Don&apos;t see your role? We&apos;re always looking for exceptional
              people.
            </p>
            <a
              href={`mailto:${site.email}?subject=Open Application — Al Adrak Careers`}
              className="inline-flex mt-6 px-10 py-4 border border-ink/20 rounded-full label font-bold text-ink hover:border-gold hover:text-brand transition-colors duration-400"
            >
              Send an Open Application
            </a>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
