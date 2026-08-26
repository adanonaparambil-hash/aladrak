"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { facilities, facilityGallery, shopFloor, type ShopFloorMedia } from "@/lib/content";

/**
 * Open the facility viewer.
 *
 * A number is a shop-floor strip index; a string is a facility name, which is
 * what the ten facility cards send. Either way the modal builds a playlist of
 * everything RELATED — the clicked item first, then the rest of that
 * facility's media, then its extra gallery photographs — so one click on a
 * facility shows all of it, without the strip on the page having to carry
 * every image.
 */
export function openFacilityMedia(target: number | string) {
  window.dispatchEvent(new CustomEvent("openFacilityMedia", { detail: target }));
}

type Playlist = { list: ShopFloorMedia[]; pos: number };

/**
 * The playlist is everything the site knows about one facility, deduped by
 * src: the clicked item leads, the strip's other media for that facility
 * follow, and the curated gallery photographs close. A facility card with no
 * strip media at all still opens onto its own cover photograph rather than
 * nothing.
 */
function playlistFor(target: number | string): Playlist | null {
  const dedupe = (list: ShopFloorMedia[]) => {
    const seen = new Set<string>();
    return list.filter((m) => (seen.has(m.src) ? false : (seen.add(m.src), true)));
  };

  /**
   * The card's own photograph, always part of its set.
   *
   * It used to be a fallback for when nothing else existed, which meant adding
   * a single gallery photograph to a facility REPLACED its cover instead of
   * adding to it — the set stayed at one item and the better picture was the
   * one that got dropped. It is appended rather than led with, so a clicked
   * item still opens first, and dedupe keeps it from appearing twice.
   */
  const coverOf = (name?: string): ShopFloorMedia[] => {
    const f = name ? facilities.find((x) => x.name === name) : undefined;
    return f ? [{ type: "img", src: f.img, label: f.name, facility: f.name }] : [];
  };

  if (typeof target === "number") {
    const item = shopFloor[target];
    if (!item) return null;
    const f = item.facility;
    const rest = f
      ? [
          ...shopFloor.filter((m) => m !== item && m.facility === f),
          ...(facilityGallery[f] ?? []),
          ...coverOf(f),
        ]
      : [];
    return { list: dedupe([item, ...rest]), pos: 0 };
  }

  const list = dedupe([
    ...shopFloor.filter((m) => m.facility === target),
    ...(facilityGallery[target] ?? []),
    ...coverOf(target),
  ]);
  return list.length ? { list, pos: 0 } : null;
}

/**
 * The facility viewer.
 *
 * Follows the same contract as ProjectModal: a CustomEvent to open, GSAP in,
 * close on ×, ESC or backdrop, and the document scroll locked while open.
 * Arrows and the side buttons walk the RELATED set only — one facility's
 * story, not the whole reel — and the thumbnail rail underneath jumps
 * anywhere in it directly.
 */
export default function FacilityMedia() {
  const [pl, setPl] = useState<Playlist | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const next = playlistFor((e as CustomEvent<number | string>).detail);
      if (next) setPl(next);
    };
    window.addEventListener("openFacilityMedia", onOpen);
    return () => window.removeEventListener("openFacilityMedia", onOpen);
  }, []);

  const close = useCallback(() => {
    const t = gsap.timeline({
      onComplete: () => {
        setPl(null);
        document.documentElement.style.overflow = "";
      },
    });
    t.to(panel.current, { autoAlpha: 0, y: 40, scale: 0.97, duration: 0.32, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.28 }, "-=0.14");
  }, []);

  const step = useCallback((d: number) => {
    setPl((p) => (p ? { ...p, pos: (p.pos + d + p.list.length) % p.list.length } : p));
  }, []);

  const jump = useCallback((i: number) => {
    setPl((p) => (p && i !== p.pos ? { ...p, pos: i } : p));
  }, []);

  const isOpen = pl !== null;
  const pos = pl?.pos ?? -1;

  /**
   * The entrance runs ONCE per opening, not on every step.
   *
   * It used to be keyed on the position, so walking the gallery re-played the
   * whole stagger — the caption, the description and the thumbnail rail all
   * blinked out and back on each click, which is the opposite of browsing. The
   * rail in particular has to stay put: it is the thing being clicked.
   *
   * Scoped with gsap.context so "[data-fm-stagger]" cannot reach outside this
   * panel, and reverted rather than killed on cleanup — a killed fromTo leaves
   * its targets wherever it stopped, and since it starts them at autoAlpha 0
   * that failure mode is an invisible modal.
   */
  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    const ctx = gsap.context(() => {
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
    }, panel);
    return () => {
      ctx.revert();
    };
  }, [isOpen]);

  /* stepping only refreshes the frame itself — everything else holds still */
  useEffect(() => {
    if (!isOpen || pos < 0 || !media.current) return;
    const tw = gsap.fromTo(
      media.current,
      { autoAlpha: 0.55, scale: 1.05 },
      { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" }
    );
    // keep the active thumbnail in view: with ten or more in the rail,
    // arrow-stepping would otherwise walk the selection off the visible strip
    rail.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    return () => {
      tw.kill();
    };
  }, [pos, isOpen]);

  /* keyboard: escape closes, arrows walk the related set */
  useEffect(() => {
    // guard on isOpen, not on pos: pos is -1 rather than null while closed, so
    // a null check here would leave Escape bound to a closed dialog
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  if (!pl) return null;
  const item = pl.list[pl.pos];
  const fac = item.facility ? facilities.find((f) => f.name === item.facility) : undefined;
  const many = pl.list.length > 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <div
        ref={backdrop}
        onClick={close}
        className="absolute inset-0 bg-ink/90 backdrop-blur-md"
        aria-hidden
      />

      {/*
        A flex column with a HEIGHT-BOUNDED media pane, not a scrolling panel.

        The previous frame let the media keep its 16:9 aspect inside a 90dvh
        panel, so on common screens the picture alone was taller than the panel
        and everything under it — the caption, the thumbnail rail, the counter —
        sat below a fold no one could see, behind a scrollbar the styling hides.
        A visitor got one photograph, one × and no clue nine more existed, which
        is exactly what was reported. Now the media is capped so the rail and
        counter are always inside the frame, and the picture gives up a little
        height to buy that.
      */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={item.label}
        className="relative w-full max-w-[min(1500px,92vw)] max-h-[90dvh] flex flex-col rounded-2xl border border-cream/12 bg-forest/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
      >
        <div
          ref={media}
          className="relative flex-none h-[clamp(240px,52dvh,700px)] bg-ink overflow-hidden rounded-t-2xl"
        >
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

          {/* the set's size, said on the picture itself */}
          {many && (
            <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-ink/70 backdrop-blur-md border border-cream/20 label label-xs text-cream/90 tabular-nums">
              {pl.pos + 1} / {pl.list.length}
            </span>
          )}

          {/* arrows ON the image — the universal sign that there are more */}
          {many && (
            <>
              <button
                onClick={() => step(-1)}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink/60 backdrop-blur-md border border-cream/25 text-cream/90 hover:bg-gold hover:text-ink hover:border-gold transition-colors duration-300 flex items-center justify-center"
              >
                <svg width="9" height="14" viewBox="0 0 9 14" aria-hidden>
                  <path d="M7.5 1 1.5 7l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink/60 backdrop-blur-md border border-cream/25 text-cream/90 hover:bg-gold hover:text-ink hover:border-gold transition-colors duration-300 flex items-center justify-center"
              >
                <svg width="9" height="14" viewBox="0 0 9 14" aria-hidden>
                  <path d="M1.5 1 7.5 7l-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* the rest of the set, FIRST under the picture — this rail is the
            answer to "is there more?", so nothing may sit above it */}
        {many && (
          <div
            ref={rail}
            data-fm-stagger
            className="flex-none flex gap-2.5 px-6 md:px-9 pt-4 overflow-x-auto no-scrollbar"
          >
            {pl.list.map((m, i) => (
              <button
                key={m.src}
                onClick={() => jump(i)}
                aria-label={m.label}
                aria-current={i === pl.pos}
                className={`relative flex-none w-24 aspect-video rounded-lg overflow-hidden border transition-all duration-300 ${
                  i === pl.pos
                    ? "border-gold ring-1 ring-gold/50"
                    : "border-cream/15 opacity-60 hover:opacity-100 hover:border-cream/40"
                }`}
              >
                {m.type === "video" ? (
                  <span className="absolute inset-0 bg-ink flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                      <path d="M5 3.5v9l8-4.5z" fill="var(--color-gold)" />
                    </svg>
                  </span>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={m.src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 md:px-9 md:py-6 overflow-y-auto no-scrollbar">
          {fac && (
            <p data-fm-stagger className="label text-gold mb-2.5">
              {fac.name}
            </p>
          )}
          <h4 data-fm-stagger className="font-display text-xl md:text-2xl text-cream mb-2.5">
            {item.label}
          </h4>
          {fac && (
            <p
              data-fm-stagger
              className="text-cream/80 font-light leading-relaxed max-w-2xl text-[14px] md:text-[15px]"
            >
              {fac.desc}
            </p>
          )}
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/70 border border-cream/20 text-cream/80 hover:text-ink hover:bg-sand hover:border-sand transition-colors duration-300 flex items-center justify-center text-xl leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
