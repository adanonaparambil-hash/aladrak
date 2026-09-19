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
            src={asset("/images/hse/hse-hero-ced-walk.jpg")}
            alt="Al Adrak’s Chief Executive Director on a site safety walk in full protective equipment, watching a machine being demonstrated"
            className="w-full h-full object-cover"
          />
          {/* Horizontal, with explicit stops rather than from/via/to.
              Tailwind pins `via` at 50%, so the ramp is already halfway to
              clear by 45% across — which on this photograph is the worker in
              bright yellow coveralls, and is also as far as a heading line
              reaches. Measured, every from/via pair either dropped the worst
              glyph background under AA there (ink/85 still only reached
              3.97:1) or washed the CED out on the right.
              Holding 72% flat across the text band and clearing between it
              and him does both jobs: 7.06:1 at the worst pixel, and 6% ink
              over the CED himself — he is the reason for the picture, so he
              stays unveiled. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,15,12,0.72)_0%,rgba(10,15,12,0.72)_55%,rgba(10,15,12,0)_82%)]" />
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
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <Reveal className="lg:col-span-8">
              <Kicker>Leadership &amp; culture</Kicker>
              <H2>Safety is led in person, not delegated</H2>
              <p className="text-ink/70 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.culture.intro}
              </p>
              <p className="text-ink/70 font-light leading-relaxed mt-4 text-[15px] md:text-base">
                {hse.culture.note}
              </p>
              {/* The four structures move up beside the photograph. They used to
                  sit in a band underneath, which left this column holding two
                  paragraphs against a picture half a metre tall. */}
              <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mt-10">
                {hse.culture.items.map((it) => (
                  <div
                    key={it.title}
                    className="h-full rounded-2xl bg-white border border-ink/10 shadow-[0_2px_18px_rgba(10,15,12,0.05)] p-5 md:p-6"
                  >
                    <h3 className="font-display text-lg md:text-xl text-forest leading-snug">
                      {it.title}
                    </h3>
                    <p className="text-ink/70 font-light leading-relaxed mt-3 text-[15px]">
                      {it.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4">
              {/* Four columns, not five. Stretching the picture to the text beside
                  it removed the gap but made it enormous — 740x806 at 1920. A
                  narrower track shrinks it and widens the text, which shortens
                  the column, so the picture comes down on both axes at once. */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[240px] border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.culture.img}
                  alt={hse.culture.imgAlt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== the 9 Life-Saving Rules — the page's dark anchor ===== */}
      <section className={DARK}>
        <div className="shell py-24 md:py-32">
          {/* Kicker, heading and intro all stack on the left. The intro used to
              sit in a four-column track on the right, where it read as a caption
              drifting away from the title; under the heading it runs left to
              right as one long line, the way the other sections open. */}
          <Reveal>
            <Kicker onDark>Non-negotiable</Kicker>
            <H2 onDark>The 9 Life-Saving Rules</H2>
            <p className="text-cream/75 font-light leading-relaxed mt-6 text-[15px] md:text-base max-w-4xl">
              {hse.lifeSavingRules.intro}
            </p>
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
          {/* Heading left, photograph right. The heading alone left the
              right half of the row empty, which read as a gap rather than as
              breathing space; the max-w-3xl measures are gone because the
              column now sets the line length. */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <Reveal className="lg:col-span-8">
              <Kicker>On site</Kicker>
              <H2>Controls built into the work, not around it</H2>
              <p className="text-ink/70 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.operations.intro}
              </p>
              {/* The seven high-risk activities used to sit in a band under this
                  row, which left the column beside the photograph holding two
                  lines of text and a lot of cream. They belong here anyway: the
                  sentence above ends on "the work that can hurt people", and
                  this is that work, named. */}
              <ul className="flex flex-wrap gap-2.5 mt-7">
                {hse.operations.highRisk.map((h) => (
                  <li
                    key={h}
                    className="px-5 py-2.5 bg-white border border-ink/15 rounded-full label label-xs text-ink/75"
                  >
                    {h}
                  </li>
                ))}
              </ul>
              {/* PTW and the pre-task assessments move up beside the picture,
                  for the same reason the high-risk list did. */}
              <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mt-10">
                {hse.operations.items.map((it) => (
                  <div key={it.title} className="h-full border-t border-ink/15 pt-5">
                    <h3 className="font-display text-lg md:text-xl text-forest leading-snug">
                      {it.title}
                    </h3>
                    <p className="text-ink/70 font-light leading-relaxed mt-3 text-[15px]">
                      {it.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4">
              {/* Four columns, not five. Stretching the picture to the text beside
                  it removed the gap but made it enormous — 740x806 at 1920. A
                  narrower track shrinks it and widens the text, which shortens
                  the column, so the picture comes down on both axes at once. */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[240px] border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.operations.img}
                  alt={hse.operations.imgAlt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== the training centre ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            <Reveal className="lg:col-span-5">
              {/* No fixed ratio at lg and up — it takes the height of the text
                  beside it, so neither column can leave a gap. */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[280px] border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.centre.img}
                  alt={hse.centre.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <H2>{hse.centre.title}</H2>
              <p className="text-ink/75 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.centre.body}
              </p>
              <blockquote className="font-serifit italic text-ink/70 text-lg md:text-xl leading-snug mt-8 pl-5 border-l-2 border-gold">
                {hse.trainingQuote}
              </blockquote>
              {/* How the teaching actually reaches the workforce — moved up out
                  of a band underneath, where it left this column short. */}
              <div className="grid sm:grid-cols-3 gap-x-7 gap-y-6 mt-9">
                {hse.trainingExtras.map((it) => (
                  <div key={it.title} className="border-t border-ink/15 pt-5">
                    <h3 className="font-display text-lg md:text-xl text-forest leading-snug">
                      {it.title}
                    </h3>
                    <p className="text-ink/70 font-light leading-relaxed mt-2.5 text-[15px]">
                      {it.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== in practice ===== */}
      <section className={LIGHT}>
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <Reveal className="lg:col-span-8">
              <Kicker>In practice</Kicker>
              <H2>Six things that happen on every project</H2>
              <p className="text-ink/70 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.practice.intro}
              </p>
              {/* All six move up beside the picture. A kicker and a heading
                  against a photograph this size was the emptiest row on the
                  page; six numbered items fill the column and give the
                  photograph a height worth having. */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-9 mt-10">
                {hse.pillars.map((p) => (
                  <div key={p.no} className="border-t border-ink/15 pt-5">
                    <span className="label label-xs text-brand">{p.no}</span>
                    <h3 className="font-display text-lg md:text-xl text-forest mt-2.5 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-ink/70 font-light leading-relaxed mt-2.5 text-[15px]">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4">
              {/* Four columns, not five. Stretching the picture to the text beside
                  it removed the gap but made it enormous — 740x806 at 1920. A
                  narrower track shrinks it and widens the text, which shortens
                  the column, so the picture comes down on both axes at once. */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[240px] border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.practice.img}
                  alt={hse.practice.imgAlt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== trade partners & occupational health ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          {/* The photograph carries the words rather than sitting above them.
              As a plain full-width picture it was a large silent rectangle;
              behind type it says what the two columns underneath have in
              common, which neither column states because each covers only its
              own half. The scrim runs bottom-up so the supervisor and the
              racking stay readable while the text sits on the lower third. */}
          <Reveal className="mb-14 md:mb-16">
            <div className="relative rounded-2xl overflow-hidden border border-ink/10 shadow-[0_10px_40px_rgba(10,15,12,0.12)] min-h-[clamp(340px,48dvh,520px)] flex items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hse.subcontractors.img}
                alt={hse.subcontractors.imgAlt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/60 to-ink/10" />
              <div className="relative p-7 md:p-12 max-w-3xl">
                <Kicker onDark>{hse.subcontractors.bandKicker}</Kicker>
                <H2 onDark>{hse.subcontractors.bandTitle}</H2>
                <p className="text-cream/80 font-light leading-relaxed mt-5 text-[15px] md:text-base">
                  {hse.subcontractors.bandLine}
                </p>
              </div>
            </div>
          </Reveal>
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
          <Reveal>
            <Kicker>{hse.wellness.kicker}</Kicker>
            <H2 className="max-w-3xl">{hse.wellness.title}</H2>
            <p className="text-ink/75 font-light leading-relaxed mt-6 text-[15px] md:text-base md:columns-2 xl:columns-3 gap-x-10 lg:gap-x-16">
              {hse.wellness.body}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12 md:mt-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
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
      </section>

      {/* ===== inside the training centre ===== */}
      <section className={TINT}>
        <div className="shell py-24 md:py-32">
          <Reveal>
            <Kicker>Inside the training centre</Kicker>
            <H2 className="max-w-2xl">Where it is taught before it is done</H2>
            <p className="text-ink/70 font-light leading-relaxed mt-6 text-[15px] md:text-base md:columns-2 xl:columns-3 gap-x-10 lg:gap-x-16 mb-14">
              {hse.galleryIntro}
            </p>
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
            <p className="text-ink/70 font-light leading-relaxed mt-6 text-[15px] md:text-base md:columns-2 xl:columns-3 gap-x-10 lg:gap-x-16">
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
            <div className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-4 mt-6">
            <p className="text-ink/70 font-light leading-relaxed text-[15px]">
              {hse.certsNote}. Every document below is the current original —
              click to read it.
            </p>
            <p className="text-ink/70 font-light leading-relaxed text-[15px]">
              The three standards cover different ground and are held together:
              45001 for occupational health and safety, 14001 for environmental
              management, 9001 for quality. The policies listed beneath them are
              the documents those systems are actually run on — the life-saving
              rules every person on site is evaluated against, and the road
              safety, drug and alcohol, and smoke-free policies that apply to
              Al Adrak staff and trade contractors alike.
            </p>
            </div>
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
