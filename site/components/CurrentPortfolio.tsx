"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentPortfolio, type RegisterProject } from "@/lib/register";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

/** how many cards are shown before the reader has to ask for the rest */
const FOLD = 6;

/**
 * The live project register.
 *
 * Sixteen jobs currently in delivery, each carried by its internal project
 * number. Only six have a photograph anywhere in the archive, so the head of a
 * card is either that photograph or a typographic plate built from the project
 * code — the same 16:9 either way, so a grid of mixed treatments still reads as
 * one set rather than as a page with holes in it.
 *
 * Sixteen full descriptions is a lot of column inches to drop on someone who
 * only wanted to see the portfolio, so the list opens at six and expands on
 * request. The hidden cards are in the DOM either way, which keeps them
 * findable by in-page search and by crawlers.
 */
export default function CurrentPortfolio() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /**
       * Only the cards that are on screen at mount get the reveal.
       *
       * A `hidden` element has no layout box, so ScrollTrigger resolves its
       * "top 95%" start against a rect of all zeros — i.e. the top of the
       * document, already scrolled past. Whether the trigger then fires
       * immediately (leaving the card at autoAlpha 1, fine) or is computed and
       * killed while still at autoAlpha 0 (leaving it invisible forever once
       * expanded, not fine) depends on ordering I cannot observe from here.
       * Animating only the visible six removes the question: the tail simply
       * appears when asked for.
       */
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

  const Head = ({ p }: { p: RegisterProject }) => {
    if (p.img) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className="w-full aspect-[16/9] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      );
    }
    // No photograph exists for this one yet. Rather than borrow a picture of a
    // different building, set the project number itself as the artwork.
    return (
      <div
        aria-hidden
        className="relative w-full aspect-[16/9] bg-forest overflow-hidden grid place-items-center"
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--color-gold) 0 1px, transparent 1px 14px)",
          }}
        />
        <div className="absolute -inset-x-8 -bottom-14 h-32 bg-brand/25 blur-3xl" />
        <span className="relative font-display text-gold/90 text-[clamp(1.75rem,3.4vw,2.75rem)] tracking-[0.08em]">
          {p.code}
        </span>
        <span className="absolute bottom-3 right-4 label label-xs text-cream/45">
          In delivery
        </span>
      </div>
    );
  };

  const Card = ({ p, hidden }: { p: RegisterProject; hidden: boolean }) => (
    <article
      data-rcard
      /* aria-hidden would strip these from the accessibility tree entirely;
         `hidden` keeps them out of the layout but still in the document, and
         the expand button brings them back with no re-fetch. */
      hidden={hidden}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-ink/10 shadow-[0_2px_18px_rgba(10,15,12,0.05)] transition-shadow duration-500 hover:shadow-[0_10px_38px_rgba(10,15,12,0.13)]"
    >
      <Head p={p} />
      <div className="flex flex-col gap-2 p-5 md:p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="label label-xs text-brand border border-brand/30 rounded-full px-3 py-1">
            {p.sector}
          </span>
          {p.img && (
            <span className="label label-xs text-ink/40">{p.code}</span>
          )}
        </div>
        <h3 className="font-display text-[clamp(1.0625rem,1.25vw,1.4375rem)] leading-tight text-ink mt-1">
          {p.name}
        </h3>
        {p.place && <p className="label text-gold">{p.place}</p>}
        <p className="text-[clamp(0.875rem,0.88vw,1.0625rem)] text-ink/70 font-light leading-relaxed mt-1">
          {p.desc}
        </p>
      </div>
    </article>
  );

  const rest = currentPortfolio.length - FOLD;

  return (
    <div ref={root} className="mt-24 md:mt-32">
      <Reveal>
        <div className="grid md:grid-cols-12 md:items-end gap-8 mb-12 md:mb-16">
          <div className="md:col-span-7">
            <p className="label text-brand mb-4">In Delivery</p>
            <h2 className="font-display h-section">
              The current
              <br />
              register.
            </h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-ink/75 text-[clamp(1rem,0.95vw,1.25rem)] font-light leading-relaxed">
            {currentPortfolio.length} live projects across Muscat, Sultan Haitham
            City, Khazaen and the coast — infrastructure, institutions,
            hospitality and homes, all under construction now.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-start">
        {currentPortfolio.map((p, i) => (
          <Card key={p.code} p={p} hidden={!open && i >= FOLD} />
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
            {open ? "Show fewer" : `Show all ${currentPortfolio.length} projects`}
          </button>
        </div>
      )}
    </div>
  );
}
