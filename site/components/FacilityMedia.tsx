"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { facilities, shopFloor } from "@/lib/content";

/** Open the shop-floor viewer at a given tile. */
export function openFacilityMedia(index: number) {
  window.dispatchEvent(new CustomEvent("openFacilityMedia", { detail: index }));
}

/**
 * The shop-floor viewer.
 *
 * The gallery tiles in Facilities are small and silent; this opens the clicked
 * clip full size with real player controls (so the sound can be turned on) and
 * the facility's own description beside it. Arrow keys and the side buttons walk
 * the whole reel, so it doubles as the "see everything" view rather than being a
 * dead end per tile.
 *
 * Follows the same contract as ProjectModal: a CustomEvent to open, GSAP in,
 * close on ×, ESC or backdrop, and the document scroll locked while open.
 */
export default function FacilityMedia() {
  const [idx, setIdx] = useState<number | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => setIdx((e as CustomEvent<number>).detail);
    window.addEventListener("openFacilityMedia", onOpen);
    return () => window.removeEventListener("openFacilityMedia", onOpen);
  }, []);

  const close = useCallback(() => {
    const t = gsap.timeline({
      onComplete: () => {
        setIdx(null);
        document.documentElement.style.overflow = "";
      },
    });
    t.to(panel.current, { autoAlpha: 0, y: 40, scale: 0.97, duration: 0.32, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.28 }, "-=0.14");
  }, []);

  const step = useCallback((d: number) => {
    setIdx((i) => (i === null ? i : (i + d + shopFloor.length) % shopFloor.length));
  }, []);

  /* animate in on open, and whenever the reel steps to another clip */
  useEffect(() => {
    if (idx === null) return;
    document.documentElement.style.overflow = "hidden";
    const t = gsap.timeline();
    t.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
    t.fromTo(
      panel.current,
      { autoAlpha: 0, y: 60, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out" },
      "-=0.2"
    );
    t.fromTo(media.current, { scale: 1.12 }, { scale: 1, duration: 1.2, ease: "power2.out" }, "-=0.55");
    t.fromTo(
      "[data-fm-stagger]",
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" },
      "-=0.95"
    );
    return () => {
      t.kill();
    };
  }, [idx]);

  /* keyboard: escape closes, arrows walk the reel */
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, close, step]);

  if (idx === null) return null;
  const item = shopFloor[idx];
  const fac = item.facility ? facilities.find((f) => f.name === item.facility) : undefined;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <div
        ref={backdrop}
        onClick={close}
        className="absolute inset-0 bg-ink/90 backdrop-blur-md"
        aria-hidden
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={item.label}
        className="relative w-full max-w-[min(1500px,92vw)] max-h-[90dvh] overflow-y-auto no-scrollbar rounded-2xl border border-cream/12 bg-forest/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
      >
        <div ref={media} className="relative aspect-video bg-ink overflow-hidden rounded-t-2xl">
          {item.type === "video" ? (
            <video
              key={item.src}
              src={item.src}
              autoPlay
              loop
              muted
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={item.src}
              src={item.src}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 md:p-9">
          {fac && (
            <p data-fm-stagger className="label text-gold mb-2.5">
              {fac.name}
            </p>
          )}
          <h4 data-fm-stagger className="font-display text-2xl md:text-3xl text-cream mb-3">
            {item.label}
          </h4>
          {fac && (
            <p
              data-fm-stagger
              className="text-cream/80 font-light leading-relaxed max-w-2xl text-[15px] md:text-base"
            >
              {fac.desc}
            </p>
          )}
          <div data-fm-stagger className="flex items-center gap-4 mt-7">
            <button
              onClick={() => step(-1)}
              className="px-5 py-2.5 rounded-full border border-cream/20 label label-xs text-cream/70 hover:text-ink hover:bg-sand hover:border-sand transition-colors duration-300"
            >
              ← Prev
            </button>
            <button
              onClick={() => step(1)}
              className="px-5 py-2.5 rounded-full border border-cream/20 label label-xs text-cream/70 hover:text-ink hover:bg-sand hover:border-sand transition-colors duration-300"
            >
              Next →
            </button>
            <span className="label label-xs text-cream/70 ml-auto tabular-nums">
              {idx + 1} / {shopFloor.length}
            </span>
          </div>
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/70 border border-cream/20 text-cream/80 hover:text-ink hover:bg-sand hover:border-sand transition-colors duration-300 flex items-center justify-center text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
