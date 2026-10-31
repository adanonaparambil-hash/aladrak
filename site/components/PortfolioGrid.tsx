"use client";
import { useText } from "@/lib/translate-client";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Project } from "@/lib/content";
import { useContentFor } from "@/lib/i18n-client";
import { currentPortfolio } from "@/lib/register";
import Reveal from "./Reveal";
import { openProject } from "./ProjectModal";

gsap.registerPlugin(ScrollTrigger);

/** Extended portfolio — cream curtain sliding over the dark gallery,
 *  masonry-style grid with staggered GSAP reveals + name wall. */
type WallCard = Project & {
  code?: string
  wide?: boolean
  /** the register's full description, opened in the modal; the card shows the blurb */
  detail?: string
};

/** the card shows the blurb; the modal shows the full register description */
const open = (p: WallCard): Project => (p.detail ? { ...p, desc: p.detail } : p);

export default function PortfolioGrid() {
  const textForLocale = useText();
  const { moreProjects, projectNames } = useContentFor();
  const root = useRef<HTMLElement>(null);

  /**
   * The delivered selection and the live register render as ONE grid: the
   * register cards were first their own headed section, then a labelled
   * sub-grid, and both read as a seam the section didn't need. Order: the
   * nineteen delivered cards, then the sixteen in delivery — led by the Public
   * Prosecution Authority Building, the rest in register order.
   *
   * This was a module constant, which meant it was built once from whichever
   * copy the module imported. It has to be rebuilt per language now, so it
   * lives in the component and memoises on the copy it came from.
   */
  const WALL: WallCard[] = useMemo(
    () => [
      ...moreProjects,
      ...[...currentPortfolio]
        .sort(
          (a, b) =>
            (b.code.includes("PPM") ? 1 : 0) - (a.code.includes("PPM") ? 1 : 0)
        )
        .map((r) => ({
          sector: r.sector,
          name: r.name,
          place: r.place ? `${r.code} · ${r.place}` : r.code,
          img: r.img,
          desc: r.blurb,
          detail: r.desc,
          specs: r.specs,
          code: r.code,
          wide: r.wide,
        })),
    ],
    [moreProjects]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gcard]").forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            autoAlpha: 0,
            y: 90,
            rotationX: 15,
            transformPerspective: 900,
            transformOrigin: "center bottom",
          },
          {
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            duration: 1.2,
            delay: (i % 3) * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative z-20 bg-cream text-ink rounded-t-[2.5rem] md:rounded-t-[4rem] -mt-10 shadow-[0_-30px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="shell py-24 md:py-32">
        <Reveal>
          <div className="grid md:grid-cols-12 md:items-end gap-8 mb-16 md:mb-20">
            <div className="md:col-span-7">
              <p className="label text-brand mb-4">{textForLocale("The Wider Portfolio")}</p>
              <h2 className="font-display h-section">
                {textForLocale("Every sector.")}<br />
                {textForLocale("Every governorate.")}</h2>
            </div>
            <p className="md:col-span-4 md:col-start-9 text-ink/75 text-[clamp(1rem,0.95vw,1.25rem)] font-light leading-relaxed">
              {textForLocale("From ministries to factories, campuses to villages — a selection from more than 450 delivered projects, and the sixteen in delivery across Oman today.")}</p>
          </div>
        </Reveal>

        {/* Masonry-ish grid */}
        {/* Every 7th card spans two rows — unless it is marked `wide`, whose
            art is a band or panorama that a 3/4.5 crop would cut in half. Such
            a card keeps its 4:3 slot and the masonry simply skips that beat;
            an intact building beats an unbroken rhythm.
            Every 7th card spans two rows, so a block is 1 tall + 6 regular = 8
            cells. That tiles exactly into 4 columns (2 rows x 4) but leaves
            holes in 3, which is why the wide layout looked gappy. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 [perspective:1200px]">
          {WALL.map((p, i) => (
            <article
              key={p.name}
              data-gcard
              onClick={() => openProject(open(p))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openProject(open(p))}
              aria-label={textForLocale(`View ${p.name} details`)}
              className={`group relative rounded-2xl overflow-hidden bg-forest cursor-pointer transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_scale(1.015)] ${
                i % 7 === 0 && !p.wide
                  ? "row-span-2 aspect-[3/4.5]"
                  : "aspect-[4/3]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={textForLocale(p.name)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />
              <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/25 text-cream px-4 py-1.5 rounded-full label label-xs">
                {textForLocale(p.sector)}
              </span>
              {textForLocale(p.code && (
                <span className="absolute top-5 right-4 label label-xs text-cream/60">
                  {textForLocale(p.code)}
                </span>
              ))}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <h3 className="font-display text-lg md:text-[22px] leading-tight text-cream">
                  {textForLocale(p.name)}
                </h3>
                <p className="label text-gold mt-2">{textForLocale(p.code ? p.place.replace(`${p.code} · `, "") : p.place)}</p>
                {/* Clamped, not merely short. The blurbs are one line each,
                    but this block is absolutely positioned against the bottom
                    of a fixed-aspect tile: without a cap, a long string grows
                    UPWARD over the photograph and out through the top of the
                    card — which is exactly what the register's four-sentence
                    descriptions did here. Three lines is the most the shortest
                    tile can hold. */}
                <p className="hidden sm:[display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden text-[clamp(0.8125rem,0.85vw,1.0625rem)] text-cream/80 font-light leading-relaxed mt-3">
                  {textForLocale(p.desc)}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Name wall */}
        <Reveal className="mt-20 md:mt-28">
          <p className="label text-brand text-center mb-10">
            {textForLocale("…and the story continues")}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 max-w-[1500px] mx-auto">
            {projectNames.map((n) => (
              <span
                key={n}
                className="px-6 py-3 border border-ink/20 rounded-full text-[clamp(0.9375rem,1.05vw,1.3125rem)] text-ink/85 hover:border-gold hover:text-brand transition-colors duration-300"
              >
                {textForLocale(n)}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
