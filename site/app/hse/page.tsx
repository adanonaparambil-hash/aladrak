import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import { hse, site } from "@/lib/content";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "Health, Safety & Environment — Al Adrak",
  description:
    "How Al Adrak protects a 6,000-strong workforce: leadership-driven safety culture, the 9 Life-Saving Rules, an in-house training centre, Wellness Tracking, and ISO 45001, 14001 and 9001 certification.",
};

/**
 * The HSE page follows the arc of the HSE department's own website copy
 * (Images/HSE/hsecontenet.txt): culture at the top because leadership owns it,
 * then the non-negotiable rules, the controls, the training that carries them,
 * the partners and the people they protect — and only then the certificates
 * that attest to all of it. Documents are the department's own PDFs, linked
 * verbatim under /docs/hse.
 */
export default function HsePage() {
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      <PageHero
        img={asset("/images/hse/hse-hero-warmup.jpg")}
        alt="The Al Adrak workforce at the seven-minute morning warm-up on site"
        scrim="faint"
        kicker={hse.kicker}
        title={hse.title}
      >
        <p className="text-cream/85 font-light text-lg md:text-xl leading-relaxed mt-8 max-w-2xl">
          {hse.lead}
        </p>
      </PageHero>

      {/* Certification strip — the headline claim; the documents live lower down */}
      <section className="relative border-y border-cream/10 bg-forest/30">
        <div className="shell py-10 md:py-12">
          <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
            {hse.certs.map((c) => (
              <Reveal key={c.code}>
                <p className="font-display text-2xl md:text-3xl text-gold">{c.code}</p>
                <p className="label label-xs text-cream/60 mt-2.5 leading-relaxed">{c.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & culture */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">Leadership &amp; culture</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-3xl">
              Safety is led in person, not delegated
            </h2>
            <p className="text-cream/75 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.culture.intro}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-14">
            {hse.culture.items.map((it, i) => (
              <Reveal key={it.title} delay={(i % 2) * 0.07}>
                <div className="h-full rounded-2xl border border-cream/10 bg-forest/25 p-7 md:p-8">
                  <h3 className="font-display text-xl md:text-2xl text-cream leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-cream/70 font-light leading-relaxed mt-3.5 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9 Life-Saving Rules */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <div className="grid lg:grid-cols-12 gap-8 lg:items-end">
              <div className="lg:col-span-8">
                <p className="label text-gold mb-5">Non-negotiable</p>
                <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream">
                  The 9 Life-Saving Rules
                </h2>
              </div>
              <p className="lg:col-span-4 text-cream/70 font-light leading-relaxed text-[15px]">
                {hse.lifeSavingRules.intro}
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-14">
            {hse.lifeSavingRules.rules.map((r, i) => (
              <Reveal key={r} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl border border-cream/10 bg-ink/40 p-6 md:p-7 flex gap-5 items-start">
                  <span className="font-display text-3xl md:text-4xl text-gold/90 leading-none flex-none">
                    {i + 1}
                  </span>
                  <p className="text-cream/85 font-light leading-relaxed text-[15px] md:text-base pt-1">
                    {r}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <a
              href={hse.lifeSavingRules.poster}
              target="_blank"
              rel="noopener noreferrer"
              className="label label-xs inline-flex items-center gap-2 text-gold border-b border-gold/50 pb-1 hover:text-cream transition-colors"
            >
              Download the Life-Saving Rules poster ↗
            </a>
          </Reveal>
        </div>
      </section>

      {/* Operational safety */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">On site</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-3xl">
              Controls built into the work, not around it
            </h2>
            <p className="text-cream/75 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.operations.intro}
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <div className="flex flex-wrap gap-3">
              {hse.operations.highRisk.map((h) => (
                <span
                  key={h}
                  className="px-5 py-2.5 bg-white/5 border border-cream/15 rounded-full label label-xs text-cream/80"
                >
                  {h}
                </span>
              ))}
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-10">
            {hse.operations.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.07}>
                <div className="h-full border-t border-cream/15 pt-6">
                  <h3 className="font-display text-xl md:text-2xl text-cream leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-cream/70 font-light leading-relaxed mt-3 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The training centre */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-cream/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.centre.img}
                  alt={hse.centre.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-6">
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream">
                {hse.centre.title}
              </h2>
              <p className="text-cream/80 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.centre.body}
              </p>
              <blockquote className="font-serifit italic text-cream/75 text-lg md:text-xl leading-snug mt-8 pl-5 border-l border-gold/50">
                {hse.trainingQuote}
              </blockquote>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-10 mt-16">
            {hse.trainingExtras.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.06}>
                <div className="border-t border-cream/15 pt-6">
                  <h3 className="font-display text-lg md:text-xl text-cream leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-cream/70 font-light leading-relaxed mt-3 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works, in practice */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">In practice</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-2xl">
              Six things that happen on every project
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-12 mt-16">
            {hse.pillars.map((p, i) => (
              <Reveal key={p.no} delay={i * 0.05}>
                <div className="border-t border-cream/15 pt-6">
                  <span className="label label-xs text-gold/80">{p.no}</span>
                  <h3 className="font-display text-xl md:text-2xl text-cream mt-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-cream/70 font-light leading-relaxed mt-3 text-[15px]">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & people — subcontractors and occupational health */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
            <div>
              <Reveal>
                <p className="label text-gold mb-5">Trade partners</p>
                <h2 className="font-display text-2xl md:text-4xl leading-tight text-cream">
                  One system for everyone on site
                </h2>
                <p className="text-cream/70 font-light leading-relaxed mt-5 text-[15px]">
                  {hse.subcontractors.intro}
                </p>
              </Reveal>
              <div className="mt-10 space-y-8">
                {hse.subcontractors.items.map((it, i) => (
                  <Reveal key={it.title} delay={i * 0.06}>
                    <div className="border-t border-cream/15 pt-5">
                      <h3 className="font-display text-lg md:text-xl text-cream leading-snug">
                        {it.title}
                      </h3>
                      <p className="text-cream/70 font-light leading-relaxed mt-2.5 text-[15px]">
                        {it.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <Reveal>
                <p className="label text-gold mb-5">Occupational health</p>
                <h2 className="font-display text-2xl md:text-4xl leading-tight text-cream">
                  Fit for the trade, checked on site
                </h2>
                <p className="text-cream/70 font-light leading-relaxed mt-5 text-[15px]">
                  {hse.health.intro}
                </p>
              </Reveal>
              <div className="mt-10 space-y-8">
                {hse.health.items.map((it, i) => (
                  <Reveal key={it.title} delay={i * 0.06}>
                    <div className="border-t border-cream/15 pt-5">
                      <h3 className="font-display text-lg md:text-xl text-cream leading-snug">
                        {it.title}
                      </h3>
                      <p className="text-cream/70 font-light leading-relaxed mt-2.5 text-[15px]">
                        {it.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Tracking */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-5">
              <p className="label text-gold mb-5">{hse.wellness.kicker}</p>
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream">
                {hse.wellness.title}
              </h2>
              <p className="text-cream/75 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.wellness.body}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {hse.wellness.photos.map((ph) => (
                  <figure key={ph.src} className="group">
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/2] border border-cream/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ph.src}
                        alt={ph.label}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="text-cream/55 font-light text-[13px] leading-relaxed mt-2.5">
                      {ph.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Inside the training centre */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">Inside the training centre</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-2xl mb-14">
              Where it is taught before it is done
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {hse.gallery.map((g, i) => (
              <Reveal key={g.src} delay={(i % 3) * 0.06}>
                <figure className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-cream/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.src}
                      alt={g.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="text-cream/60 font-light text-[14px] leading-relaxed mt-3.5">
                    {g.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2026 objectives & targets */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">Objectives &amp; targets, {hse.objectives.year}</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-3xl">
              Measured, reviewed, signed at the top
            </h2>
            <p className="text-cream/75 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.objectives.intro}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-14">
            {hse.objectives.kpis.map((k, i) => (
              <Reveal key={k.label} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl border border-cream/10 bg-forest/25 p-7 md:p-8">
                  <p className="font-display text-4xl md:text-5xl text-gold leading-none">
                    {k.value}
                  </p>
                  <p className="text-cream/70 font-light leading-relaxed mt-4 text-[14px] md:text-[15px]">
                    {k.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <a
              href={hse.objectives.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="label label-xs inline-flex items-center gap-2 text-gold border-b border-gold/50 pb-1 hover:text-cream transition-colors"
            >
              Read the full 2026 Objectives, Targets &amp; KPI document ↗
            </a>
          </Reveal>
        </div>
      </section>

      {/* Certificates & policies */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">The paperwork behind the claim</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-3xl">
              Certificates &amp; policies
            </h2>
            <p className="text-cream/70 font-light leading-relaxed mt-6 max-w-3xl text-[15px]">
              {hse.certsNote}. Every document below is the current original — click
              to read it.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 md:gap-6 mt-14">
            {hse.certs.map((c, i) => (
              <Reveal key={c.code} delay={i * 0.07}>
                <a
                  href={c.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                  aria-label={`Open the ${c.code} certificate`}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-cream/15 bg-white aspect-[210/297]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.img}
                      alt={`${c.code} certificate issued to ${site.legalName}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="font-display text-lg md:text-xl text-cream mt-4">{c.code}</p>
                  <p className="label label-xs text-cream/55 mt-1.5">{c.reg}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {hse.policies.map((pol, i) => (
              <Reveal key={pol.file} delay={(i % 3) * 0.05}>
                <a
                  href={pol.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-cream/15 bg-ink/40 px-6 py-4.5 hover:border-gold/60 transition-colors"
                >
                  <span className="text-cream/85 font-light text-[15px]">{pol.name}</span>
                  <span className="label label-xs text-gold flex-none group-hover:text-cream transition-colors">
                    PDF ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact band */}
      <section className="relative border-t border-cream/10 bg-forest/30">
        <div className="shell py-20 md:py-24 text-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight">
              Questions about our HSE standards?
            </h2>
            <p className="text-cream/70 font-light mt-5 max-w-xl mx-auto leading-relaxed">
              Clients and consultants are welcome to review our policies, method
              statements and training records.
            </p>
            <a
              href={`mailto:${site.email}?subject=HSE enquiry`}
              className="inline-flex mt-9 px-9 py-4 bg-gold text-ink rounded-full label font-bold hover:bg-cream transition-colors duration-300"
            >
              Contact our HSE team
            </a>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
