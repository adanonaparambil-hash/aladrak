import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { hse, site } from "@/lib/content";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "Health, Safety & Environment — Al Adrak",
  description:
    "How Al Adrak protects a 6,000-strong workforce: leadership-driven safety culture, the 9 Life-Saving Rules, an in-house training centre, Wellness Tracking, and ISO 45001, 14001 and 9001 certification.",
};

/**
 * The HSE page — light, on the site's own cream and parchment.
 *
 * It was ink from top to bottom, which made a long, text-heavy page hard to
 * read: cream body copy at 70% on near-black is fine for one short section and
 * punishing across a dozen. The page now reads as daylight, using the same
 * cream/parchment alternation as the portfolio and Excellence sections, with
 * ink type.
 *
 * Two deliberate dark anchors remain, because an all-light page of this length
 * has no rhythm: the Life-Saving Rules (which should feel non-negotiable) and
 * the closing contact band. The KPI tiles are forest for the same reason.
 *
 * The hero stays photographic and full-bleed rather than becoming a light split
 * panel: the fixed header's nav is cream and transparent until scrolled, so the
 * top of the page has to stay dark enough for it to read. Its foot fades to
 * cream so the hero hands off to the page instead of ending on a hard line.
 *
 * Content order follows the HSE department's own website copy
 * (Images/HSE/hsecontenet.txt): culture first because leadership owns it, then
 * the rules, the controls, the training that carries them, the partners and
 * the people they protect — and only then the certificates that attest to it.
 */

/** section shells, so the alternation is declared once and stays consistent */
const LIGHT = "relative bg-cream";
const TINT = "relative bg-parchment border-y border-ink/10";
const DARK = "relative bg-forest text-cream";

function Kicker({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return <p className={`label mb-5 ${onDark ? "text-gold" : "text-brand"}`}>{children}</p>;
}

function H2({
  children,
  onDark = false,
  className = "",
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-3xl md:text-5xl leading-tight ${
        onDark ? "text-cream" : "text-forest"
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export default function HsePage() {
  return (
    <main className="bg-cream min-h-screen text-ink">
      <Header />

      {/* ===== hero ===== */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/hse/hse-hero-ppe.jpg")}
            alt="An Al Adrak carpenter in full protective equipment — hard hat, goggles, mask and gloves — at a radial arm saw"
            className="w-full h-full object-cover"
          />
          {/* horizontal: holds the heading, clears where the worker is */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/62 via-ink/28 to-transparent" />
          {/* Vertical: a dark top for the fixed header's cream nav to read
              against, and a cream foot so the hero dissolves into the page
              rather than ending on a hard line.
              Explicit stops, not from/via/to: `via-transparent` sits at 50%,
              which ramped cream across the whole bottom half and washed the
              worker out from the waist down. Cream now takes only the last
              fifth, where there is nothing but floor. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,15,12,0.55)_0%,rgba(10,15,12,0)_34%,rgba(10,15,12,0)_80%,var(--color-cream)_100%)]" />
        </div>
        <div className="relative shell [text-shadow:0_1px_2px_rgba(10,15,12,0.98),0_2px_8px_rgba(10,15,12,0.92),0_4px_26px_rgba(10,15,12,0.85)]">
          <Reveal>
            <p className="label text-gold mb-6">{hse.kicker}</p>
            <h1 className="font-display text-cream text-5xl md:text-7xl leading-[1.02] max-w-3xl">
              {hse.title}
            </h1>
            <p className="text-cream/90 font-light text-lg md:text-xl leading-relaxed mt-8 max-w-2xl">
              {hse.lead}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== certification strip ===== */}
      <section className={TINT}>
        <div className="shell py-10 md:py-12">
          <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
            {hse.certs.map((c) => (
              <Reveal key={c.code}>
                <p className="font-display text-2xl md:text-3xl text-brand">{c.code}</p>
                <p className="label label-xs text-ink/60 mt-2.5 leading-relaxed">{c.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== leadership & culture ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>Leadership &amp; culture</Kicker>
            <H2 className="max-w-3xl">Safety is led in person, not delegated</H2>
            <p className="text-ink/70 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.culture.intro}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-14">
            {hse.culture.items.map((it, i) => (
              <Reveal key={it.title} delay={(i % 2) * 0.07}>
                <div className="h-full rounded-2xl bg-white border border-ink/10 shadow-[0_2px_18px_rgba(10,15,12,0.05)] p-7 md:p-8">
                  <h3 className="font-display text-xl md:text-2xl text-forest leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-ink/70 font-light leading-relaxed mt-3.5 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== the 9 Life-Saving Rules — the page's dark anchor ===== */}
      <section className={DARK}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <div className="grid lg:grid-cols-12 gap-8 lg:items-end">
              <div className="lg:col-span-8">
                <Kicker onDark>Non-negotiable</Kicker>
                <H2 onDark>The 9 Life-Saving Rules</H2>
              </div>
              <p className="lg:col-span-4 text-cream/75 font-light leading-relaxed text-[15px]">
                {hse.lifeSavingRules.intro}
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-14">
            {hse.lifeSavingRules.rules.map((r, i) => (
              <Reveal key={r} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl bg-white/[0.06] border border-cream/15 p-6 md:p-7 flex gap-5 items-start">
                  <span className="font-display text-3xl md:text-4xl text-gold leading-none flex-none">
                    {i + 1}
                  </span>
                  <p className="text-cream/90 font-light leading-relaxed text-[15px] md:text-base pt-1">
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

      {/* ===== operational controls ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>On site</Kicker>
            <H2 className="max-w-3xl">Controls built into the work, not around it</H2>
            <p className="text-ink/70 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.operations.intro}
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <div className="flex flex-wrap gap-3">
              {hse.operations.highRisk.map((h) => (
                <span
                  key={h}
                  className="px-5 py-2.5 bg-white border border-ink/15 rounded-full label label-xs text-ink/75"
                >
                  {h}
                </span>
              ))}
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-12">
            {hse.operations.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.07}>
                <div className="h-full border-t border-ink/15 pt-6">
                  <h3 className="font-display text-xl md:text-2xl text-forest leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-ink/70 font-light leading-relaxed mt-3 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== the training centre ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.centre.img}
                  alt={hse.centre.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-6">
              <H2>{hse.centre.title}</H2>
              <p className="text-ink/75 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.centre.body}
              </p>
              <blockquote className="font-serifit italic text-ink/70 text-lg md:text-xl leading-snug mt-8 pl-5 border-l-2 border-gold">
                {hse.trainingQuote}
              </blockquote>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-10 mt-16">
            {hse.trainingExtras.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.06}>
                <div className="border-t border-ink/15 pt-6">
                  <h3 className="font-display text-lg md:text-xl text-forest leading-snug">
                    {it.title}
                  </h3>
                  <p className="text-ink/70 font-light leading-relaxed mt-3 text-[15px]">
                    {it.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== in practice ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>In practice</Kicker>
            <H2 className="max-w-2xl">Six things that happen on every project</H2>
          </Reveal>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-12 mt-16">
            {hse.pillars.map((p, i) => (
              <Reveal key={p.no} delay={i * 0.05}>
                <div className="border-t border-ink/15 pt-6">
                  <span className="label label-xs text-brand">{p.no}</span>
                  <h3 className="font-display text-xl md:text-2xl text-forest mt-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-ink/70 font-light leading-relaxed mt-3 text-[15px]">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== trade partners & occupational health ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
            {[
              {
                kicker: "Trade partners",
                title: "One system for everyone on site",
                intro: hse.subcontractors.intro,
                items: hse.subcontractors.items,
              },
              {
                kicker: "Occupational health",
                title: "Fit for the trade, checked on site",
                intro: hse.health.intro,
                items: hse.health.items,
              },
            ].map((col) => (
              <div key={col.kicker}>
                <Reveal>
                  <Kicker>{col.kicker}</Kicker>
                  <h2 className="font-display text-2xl md:text-4xl leading-tight text-forest">
                    {col.title}
                  </h2>
                  <p className="text-ink/70 font-light leading-relaxed mt-5 text-[15px]">
                    {col.intro}
                  </p>
                </Reveal>
                <div className="mt-10 space-y-8">
                  {col.items.map((it, i) => (
                    <Reveal key={it.title} delay={i * 0.06}>
                      <div className="border-t border-ink/15 pt-5">
                        <h3 className="font-display text-lg md:text-xl text-forest leading-snug">
                          {it.title}
                        </h3>
                        <p className="text-ink/70 font-light leading-relaxed mt-2.5 text-[15px]">
                          {it.desc}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Wellness Tracking ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-5">
              <Kicker>{hse.wellness.kicker}</Kicker>
              <H2>{hse.wellness.title}</H2>
              <p className="text-ink/75 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.wellness.body}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {hse.wellness.photos.map((ph) => (
                  <figure key={ph.src} className="group">
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/2] border border-ink/10 shadow-[0_6px_24px_rgba(10,15,12,0.10)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ph.src}
                        alt={ph.label}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="text-ink/60 font-light text-[13px] leading-relaxed mt-2.5">
                      {ph.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== inside the training centre ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>Inside the training centre</Kicker>
            <H2 className="max-w-2xl mb-14">Where it is taught before it is done</H2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {hse.gallery.map((g, i) => (
              <Reveal key={g.src} delay={(i % 3) * 0.06}>
                <figure className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-ink/10 shadow-[0_6px_24px_rgba(10,15,12,0.10)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.src}
                      alt={g.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="text-ink/65 font-light text-[14px] leading-relaxed mt-3.5">
                    {g.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2026 objectives & targets ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>Objectives &amp; targets, {hse.objectives.year}</Kicker>
            <H2 className="max-w-3xl">Measured, reviewed, signed at the top</H2>
            <p className="text-ink/70 font-light leading-relaxed mt-6 max-w-3xl text-[15px] md:text-base">
              {hse.objectives.intro}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-14">
            {hse.objectives.kpis.map((k, i) => (
              <Reveal key={k.label} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl bg-forest text-cream p-7 md:p-8">
                  <p className="font-display text-4xl md:text-5xl text-gold leading-none">
                    {k.value}
                  </p>
                  <p className="text-cream/80 font-light leading-relaxed mt-4 text-[14px] md:text-[15px]">
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
              className="label label-xs inline-flex items-center gap-2 text-brand border-b border-brand/50 pb-1 hover:text-gold hover:border-gold transition-colors"
            >
              Read the full 2026 Objectives, Targets &amp; KPI document ↗
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===== certificates & policies ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>The paperwork behind the claim</Kicker>
            <H2 className="max-w-3xl">Certificates &amp; policies</H2>
            <p className="text-ink/70 font-light leading-relaxed mt-6 max-w-3xl text-[15px]">
              {hse.certsNote}. Every document below is the current original —
              click to read it.
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
                  <div className="relative rounded-2xl overflow-hidden border border-ink/15 bg-white aspect-[210/297] shadow-[0_8px_30px_rgba(10,15,12,0.12)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.img}
                      alt={`${c.code} certificate issued to ${site.legalName}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="font-display text-lg md:text-xl text-forest mt-4 group-hover:text-brand transition-colors">
                    {c.code}
                  </p>
                  <p className="label label-xs text-ink/50 mt-1.5">{c.reg}</p>
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
                  className="group flex items-center justify-between gap-4 rounded-xl border border-ink/15 bg-white px-6 py-4 hover:border-gold hover:shadow-[0_6px_20px_rgba(10,15,12,0.10)] transition-all duration-300"
                >
                  <span className="text-ink/85 font-light text-[15px]">{pol.name}</span>
                  <span className="label label-xs text-brand flex-none group-hover:text-gold transition-colors">
                    PDF ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== contact band ===== */}
      <section className={DARK}>
        <div className="shell py-20 md:py-24 text-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight">
              Questions about our HSE standards?
            </h2>
            <p className="text-cream/75 font-light mt-5 max-w-xl mx-auto leading-relaxed">
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
