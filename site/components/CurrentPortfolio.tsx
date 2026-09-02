"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentPortfolio, type RegisterProject } from "@/lib/register";
import { openProject } from "./ProjectModal";

gsap.registerPlugin(ScrollTrigger);

/** how many cards are shown before the reader has to ask for the rest */
const FOLD = 6;

/**
 * The live project register — sixteen jobs currently on site, carried by their
 * internal project numbers.
 *
 * Not a section of its own: it renders directly under the wider-portfolio
 * masonry grid, in the same card language, under the same "Every sector. Every
 * governorate." heading — a hairline and a small label are the only seam.
 * Seven cards carry a real photograph or render; the rest use a typographic
 * plate of the project number (baked in scripts/prep-register.mjs) until a
 * picture arrives. Clicking any card opens the shared project modal, which is
 * where the full register description lives — the card itself shows only the
 * first lines, like its delivered neighbours above.
 */
export default function CurrentPortfolio() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Only the cards on screen at mount get the reveal: a `hidden` element
         has no layout box, so its trigger position is garbage. The tail simply
         appears when asked for. */
      gsap.utils.toArray<HTMLElement>("[data-rcard]:not([hidden])").forEach((el, i) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: (i % 3) * 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  /**
   * Revealing the tail adds rows below the fold, which moves every trigger
   * underneath this section. Without the refresh those triggers keep firing
   * against stale positions and the sections further down the page animate at
   * the wrong moment.
   */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(t);
  }, [open]);

  const show = (p: RegisterProject) =>
    openProject({
      sector: p.sector,
      name: p.name,
      // the modal's gold place line carries the register number too
      place: p.place ? `${p.code} · ${p.place}` : p.code,
      img: p.img,
      desc: p.desc,
    });

  const rest = currentPortfolio.length - FOLD;

  return (
    <div ref={root} className="mt-16 md:mt-20">
      {/* the seam: a hairline and a whisper, not a heading */}
      <div className="flex items-center gap-5 mb-8 md:mb-10">
        <span className="label label-xs text-brand flex-none">In delivery — {currentPortfolio.length} live projects</span>
        <span className="h-px flex-1 bg-ink/15" aria-hidden />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        {currentPortfolio.map((p, i) => (
          <article
            key={p.code}
            data-rcard
            hidden={!open && i >= FOLD}
            onClick={() => show(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && show(p)}
            aria-label={`View ${p.name} details`}
            className="group relative rounded-2xl overflow-hidden bg-forest cursor-pointer aspect-[4/3] transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_scale(1.015)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.img}
              alt={p.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />
            <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/25 text-cream px-4 py-1.5 rounded-full label label-xs">
              {p.sector}
            </span>
            <span className="absolute top-5 right-4 label label-xs text-cream/60">
              {p.code}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <h3 className="font-display text-lg md:text-[22px] leading-tight text-cream">
                {p.name}
              </h3>
              {p.place && <p className="label text-gold mt-2">{p.place}</p>}
              <p className="hidden sm:[display:-webkit-box] text-[clamp(0.8125rem,0.85vw,1.0625rem)] text-cream/80 font-light leading-relaxed mt-3 [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                {p.desc}
              </p>
            </div>
          </article>
        ))}
      </div>

      {rest > 0 && (
        <div className="flex justify-center mt-10 md:mt-12">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="label px-8 py-4 rounded-full border border-ink/25 text-ink/80 hover:border-gold hover:text-brand transition-colors duration-300"
          >
            {open ? "Show fewer" : `Show all ${currentPortfolio.length} live projects`}
          </button>
        </div>
      )}
    </div>
  );
}
