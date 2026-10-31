"use client";
import { useText } from "@/lib/translate-client";
import { getContent, localePath, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n-client";
import Reveal from "./Reveal";
import VisitorCounter from "./VisitorCounter";
import { asset } from "@/lib/asset";

export default function Footer({ lang = "en" }: { lang?: Locale }) {
  const textForLocale = useText();
  const locale = useLocale();
  const { site } = getContent(lang);
  return (
    <footer className="relative z-20 bg-forest text-cream/85 overflow-hidden">
      {/* Big CTA */}
      <div className="shell pt-24 md:pt-32 pb-16 text-center border-b border-white/10">
        <Reveal>
          <p className="font-serifit italic text-2xl text-cream/70 mb-6">
            {textForLocale("Have a vision worth building?")}</p>
          <h2 className="font-display text-[11vw] md:text-7xl lg:text-8xl leading-none">
            {textForLocale("Let's build the")}<br />
            {textForLocale("next landmark")}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <a
              href={`mailto:${site.email}`}
              className="px-12 py-5 bg-gold text-ink rounded-full label font-bold hover:bg-cream transition-colors duration-500"
            >
              {textForLocale(site.email)}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="px-12 py-5 border border-white/25 rounded-full label font-bold hover:border-gold hover:text-gold transition-colors duration-500"
            >
              {textForLocale(site.phone)}
            </a>
          </div>
        </Reveal>
      </div>

      {/* Bottom bar */}
      <div className="shell py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/logo-light.png")}
            alt={textForLocale("Al Adrak")}
            className="h-10 w-auto"
          />
          <span className="label text-gold/80">{textForLocale("est. 1986")}</span>
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-7">
          {["About", "Expertise", "Projects", "Facilities", "Team"].map((l) => (
            <a
              key={l}
              href={asset(localePath(locale, `/#${l.toLowerCase()}`))}
              // py-2.5 lifts these off a 19px line box; the gap-7 row already
              // spaces them horizontally, so this only buys vertical reach
              className="label text-cream/60 hover:text-gold transition-colors py-2.5"
            >
              {textForLocale(l)}
            </a>
          ))}
          <a
            href={asset("/al-adrak-brochure.pdf")}
            download
            className="label text-gold hover:text-cream transition-colors py-2.5"
          >
            {textForLocale("Brochure ↓")}</a>
          <a
            href={asset(localePath(locale, "/news/"))}
            className="label text-gold hover:text-cream transition-colors py-2.5"
          >
            {textForLocale("News")}</a>
          <a
            href={asset(localePath(locale, "/careers/"))}
            className="label text-gold hover:text-cream transition-colors py-2.5"
          >
            {textForLocale("Careers")}</a>
          <a
            href={asset(localePath(locale, "/hse/"))}
            className="label text-gold hover:text-cream transition-colors py-2.5"
          >
            {textForLocale("HSE")}</a>
        </nav>
        <p className="label text-cream/70">
          © {new Date().getFullYear()} {textForLocale(site.legalName)}
        </p>
      </div>
      <VisitorCounter />
    </footer>
  );
}
