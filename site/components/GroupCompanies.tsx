"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  groupCompanies,
  type GroupCompany,
  type HotelProperty,
} from "@/lib/content";

/**
 * The Adrak Group logo wall.
 *
 * Lifted out of Future.tsx — which is a server component — because one tile is
 * no longer a link. Adrak Hotels & Resorts operates three properties on three
 * separate domains, so it opens a chooser and asks which before sending anyone
 * anywhere.
 */
export default function GroupCompanies() {
  const [chooser, setChooser] = useState<GroupCompany | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {groupCompanies.map((g) => (
          <Tile key={g.name} g={g} onChoose={() => setChooser(g)} />
        ))}
      </div>
      {chooser?.choose && (
        <HotelChooser
          title={chooser.name}
          properties={chooser.choose}
          onClose={() => setChooser(null)}
        />
      )}
    </>
  );
}

function Tile({ g, onChoose }: { g: GroupCompany; onChoose: () => void }) {
  const face = (
    <div className="group h-full rounded-2xl bg-cream border border-white/20 overflow-hidden flex flex-col transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      {g.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={g.img}
          alt={`${g.name} logo`}
          loading="lazy"
          className="w-full aspect-[2/1] object-contain bg-white p-4"
        />
      ) : (
        <div className="w-full aspect-[2/1] bg-white flex items-center justify-center p-4">
          <span className="font-display text-xl text-forest text-center leading-snug">
            {g.name}
          </span>
        </div>
      )}
      <div className="px-4 py-3 bg-cream border-t border-ink/10 flex items-center justify-between gap-2">
        <span className="label label-xs text-ink/70 leading-snug sm:truncate">
          {g.name}
        </span>
        {g.choose ? (
          <span className="label label-xs text-brand group-hover:text-gold transition-colors flex-none">
            {g.choose.length} properties ↗
          </span>
        ) : (
          g.url && (
            <span className="label label-xs text-brand group-hover:text-gold transition-colors flex-none">
              Visit ↗
            </span>
          )
        )}
      </div>
    </div>
  );

  if (g.choose) {
    return (
      <button
        type="button"
        onClick={onChoose}
        aria-haspopup="dialog"
        aria-label={`Choose a property from ${g.name}`}
        className="text-left"
      >
        {face}
      </button>
    );
  }
  if (g.url) {
    return (
      <a
        href={g.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${g.name}`}
      >
        {face}
      </a>
    );
  }
  return <div>{face}</div>;
}

/**
 * A small chooser. Deliberately not the full ProjectModal: there is nothing to
 * read here, only a choice to make, so the panel is barely larger than the
 * photographs it holds.
 */
function HotelChooser({
  title,
  properties,
  onClose,
}: {
  title: string;
  properties: HotelProperty[];
  onClose: () => void;
}) {
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    /**
     * The overlay unmounts on the close animation finishing — but GSAP advances
     * on requestAnimationFrame, and a browser that has throttled rAF to a stop
     * (a backgrounded tab, most commonly) never fires onComplete. The overlay
     * would then sit there with the document still scroll-locked, and the page
     * underneath frozen, until the tab was focused again. The guard closes it
     * on a timer whichever way the animation goes; whichever path arrives first
     * cancels the other.
     */
    let guard = 0;
    const done = () => {
      window.clearTimeout(guard);
      onClose();
    };
    const t = gsap.timeline({ onComplete: done });
    t.to(panel.current, { autoAlpha: 0, y: 40, scale: 0.97, duration: 0.28, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.24 }, "-=0.12");
    guard = window.setTimeout(done, 700);
  }, [onClose]);

  useEffect(() => {
    /* The page scrolls under a fixed overlay otherwise, and Lenis keeps its own
       momentum going, so the backdrop drifts away from the content behind it. */
    document.documentElement.style.overflow = "hidden";
    const t = gsap.timeline();
    t.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    t.fromTo(
      panel.current,
      { autoAlpha: 0, y: 50, scale: 0.95 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
      "-=0.18"
    );
    t.fromTo(
      "[data-hotel-card]",
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09, ease: "power3.out" },
      "-=0.3"
    );
    first.current?.focus({ preventScroll: true });
    return () => {
      t.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div
        ref={backdrop}
        onClick={close}
        className="absolute inset-0 bg-ink/85 backdrop-blur-xl"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} — choose a property`}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-forest border border-white/15 shadow-[0_60px_140px_rgba(0,0,0,0.7)] p-6 md:p-9"
      >
        <p className="label text-gold">{title}</p>
        <h3 className="font-display text-2xl md:text-[32px] leading-tight text-cream mt-2">
          Which of our properties?
        </h3>
        <p className="text-cream/65 font-light text-sm md:text-base mt-2">
          {properties.length} properties in Oman and Kerala, each with its own site.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-7">
          {properties.map((p, i) => (
            <a
              key={p.url}
              ref={i === 0 ? first : undefined}
              data-hotel-card
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-2xl overflow-hidden border border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="w-full aspect-[3/2] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* the type sits on the photograph, so it needs its own ground */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/35 to-ink/5" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="label label-xs text-gold">{p.kind}</p>
                <h4 className="font-display text-xl md:text-[26px] leading-tight text-cream mt-1.5">
                  {p.name}
                </h4>
                <p className="text-cream/75 font-light text-sm mt-1">{p.place}</p>
                <span className="inline-flex items-center gap-2 label label-xs text-cream/90 mt-4 border-b border-gold/60 pb-1 group-hover:text-gold transition-colors">
                  Visit site ↗
                </span>
              </div>
            </a>
          ))}
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/50 backdrop-blur-md border border-white/25 text-cream flex items-center justify-center hover:bg-gold hover:text-ink hover:rotate-90 transition-all duration-400 z-10"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
