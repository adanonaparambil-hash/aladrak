"use client";
import { useText } from "@/lib/translate-client";
import { getContent, type Locale } from "@/lib/i18n";
import Reveal from "./Reveal";
import { years } from "@/lib/anniversary";
import { asset } from "@/lib/asset";

/**
 * The logo for each name in the bands, from public/images/clients (prepared by scripts/prep-client-logos.mjs).
 * Keyed by the name exactly as it is written in content.ts. A name without a logo here still shows, as text, so
 * adding a client to the list can never leave a gap in the band.
 */
const LOGO: Record<string, string> = {
  "Central Bank of Oman": "central-bank-of-oman",
  "Royal Oman Police": "royal-oman-police",
  "Ministry of Defense": "ministry-of-defense",
  "Ministry of Health": "ministry-of-health",
  "Ministry of Higher Education": "ministry-of-higher-education",
  "Ahli Bank": "ahli-bank",
  "Haya Water": "haya-water",
  "Sultan Qaboos University": "sultan-qaboos-university",
  "Mazoon Dairy": "mazoon-dairy",
  "Renaissance": "renaissance",
  "Oman Refinery Co.": "oman-refinery",
  "Saud Bahwan Group": "saud-bahwan-group",
  "Suhail Bahwan Group": "suhail-bahwan-group",
  "Zubair Corporation": "zubair-corporation",
  "Madayn": "madayn",
  "Ministry of Housing & Urban Planning": "ministry-of-housing-urban-planning",
  "Public Prosecution": "public-prosecution",
  "Sohar University": "sohar-university",
  "Muscat Insurance": "muscat-insurance",
  "Al Maha Petroleum": "al-maha-petroleum",
};

/**
 * One moving band of client logos. Every logo sits on the same white card, so a logo with its own white
 * background and one with none look alike and nothing is lost against the beige. The track is the list twice
 * and slides by exactly half; each card carries its own right margin (not a flex gap) so that half is exactly
 * one list and the loop has no jump. It pauses under the pointer so a logo can be looked at.
 */
function Row({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const textForLocale = useText();
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-6 md:py-7 border-t border-ink/10 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"
    >
      <div
        className={`flex w-max hover:[animation-play-state:paused] ${
          reverse ? "animate-marquee-rev" : "animate-marquee"
        }`}
      >
        {doubled.map((c, i) => {
          const file = LOGO[c];
          const name = textForLocale(c);
          return (
            <div
              key={i}
              aria-hidden={i >= items.length || undefined}
              className="shrink-0 mr-5 md:mr-7 flex items-center justify-center w-[190px] h-[76px] md:w-[260px] md:h-[100px] bg-white rounded-2xl border border-ink/10 shadow-[0_1px_3px_rgba(16,39,26,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_8px_20px_rgba(16,39,26,0.12)]"
            >
              {file ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset(`/images/clients/${file}.png`)}
                  alt={name}
                  title={name}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="w-auto h-auto max-w-[150px] max-h-[54px] md:max-w-[210px] md:max-h-[72px] object-contain select-none"
                />
              ) : (
                <span className="font-display text-lg md:text-xl text-taupe px-4 text-center">{name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Clients({ lang = "en" }: { lang?: Locale }) {
  const textForLocale = useText();
  const { clients, clientele } = getContent(lang);
  const half = Math.ceil(clients.length / 2);
  const total = clientele.reduce((n, g) => n + g.names.length, 0);
  return (
    <section className="bg-parchment text-ink relative z-20 overflow-hidden">
      <div className="py-20 md:py-28">
        <p className="label text-brand text-center mb-14">
          {textForLocale("Trusted by the nation's finest")}</p>
        <Row items={clients.slice(0, half)} />
        <Row items={clients.slice(half)} reverse />
        <div className="border-t border-ink/10" />

        {/* ===== Full clientele, categorized ===== */}
        <div className="shell mt-20 md:mt-28">
          <Reveal className="grid md:grid-cols-12 md:items-end gap-6 mb-14">
            <h3 className="md:col-span-7 font-display h-section">
              {total}{textForLocale("+ clients.")}<br />
              {textForLocale("One relationship standard.")}</h3>
            <p className="md:col-span-4 md:col-start-9 text-taupe font-light leading-relaxed">
              {textForLocale("Government and the public sector account for the dominant share of our turnover — a trust earned over ")}{years()} {textForLocale(" years of delivery.")}</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
            {clientele.map((g, gi) => (
              <Reveal key={g.group} delay={gi * 0.08}>
                <div>
                  <div className="flex items-baseline justify-between border-b border-ink/15 pb-4 mb-6">
                    <h4 className="font-display text-xl md:text-2xl">
                      {textForLocale(g.group)}
                    </h4>
                    <span className="label text-gold">
                      {textForLocale(String(g.names.length).padStart(2, "0"))}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-2.5">
                    {g.names.map((n) => (
                      <span
                        key={n}
                        className="px-5 py-2.5 bg-white/60 border border-ink/15 rounded-full text-[clamp(0.875rem,0.95vw,1.1875rem)] text-ink/85 hover:border-gold hover:text-brand transition-colors duration-300"
                      >
                        {textForLocale(n)}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
