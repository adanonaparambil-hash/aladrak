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
 * no longer a link. Adrak Hotels & Resorts runs two resorts on separate
 * domains, so it opens a chooser and asks which before sending anyone
 * anywhere. Aloft Muscat has its own tile — see the note in content.ts.
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
            {g.choose.length} resorts ↗
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
 * A property with no website. Where the linked cards are one photograph and a
 * "Visit site", this one is the visit: a main pane, a strip of thumbnails that
 * swap it — four stills and, last, an eight-second muted loop from the boat —
 * and the address, with a Maps link as the only thing that leaves the page.
 * The film is a slide rather than an autoplay because it is 576p phone footage
 * and would sit soft under the stills; chosen, it reads as what it is.
 */
function UnlinkedProperty({ p }: { p: HotelProperty }) {
  const slides = [
    { kind: "still" as const, src: p.img, alt: p.name },
    ...(p.gallery ?? []).map((src, i) => ({ kind: "still" as const, src, alt: `${p.name} — photograph ${i + 2}` })),
    ...(p.film ? [{ kind: "film" as const, src: p.film.src, poster: p.film.poster, alt: `${p.name} — from the boat` }] : []),
  ];
  const [at, setAt] = useState(0);
  const cur = slides[at];
  const maps = p.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}`)}`
    : undefined;

  return (
    <div
      data-hotel-card
      className="mt-4 md:mt-5 rounded-2xl overflow-hidden border border-white/15 bg-ink/30"
    >
      <div className="grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* media: the pane, then the strip */}
        <div className="bg-ink/50">
          <div className="relative aspect-[3/2] overflow-hidden">
            {cur.kind === "film" ? (
              <video
                key={cur.src}
                src={cur.src}
                poster={cur.poster}
                autoPlay
                muted
                loop
                playsInline
                aria-label={cur.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={cur.src}
                src={cur.src}
                alt={cur.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex gap-1.5 p-1.5" role="tablist" aria-label={`${p.name} — photographs`}>
            {slides.map((sl, i) => (
              <button
                key={sl.src}
                type="button"
                role="tab"
                aria-selected={i === at}
                aria-label={sl.alt}
                onClick={() => setAt(i)}
                className={`relative flex-1 aspect-[3/2] overflow-hidden rounded-md border transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  i === at ? "border-gold opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sl.kind === "film" ? sl.poster : sl.src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {sl.kind === "film" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-ink/60 backdrop-blur-sm border border-white/40 flex items-center justify-center text-cream">
                      <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden="true">
                        <path d="M0.5 0.5 L7.5 4.5 L0.5 8.5 Z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* words: what and where; the address stands where a link would */}
        <div className="p-5 md:p-6 flex flex-col">
          <p className="label label-xs text-gold">{p.kind}</p>
          <h4 className="font-display text-xl md:text-[26px] leading-tight text-cream mt-1.5">{p.name}</h4>
          <p className="text-cream/75 font-light text-sm mt-1">{p.place}</p>
          {p.address && (
            <p className="text-cream/60 font-light text-sm leading-relaxed mt-4 pl-3 border-l border-gold/50">
              {p.address}
            </p>
          )}
          <p className="text-cream/45 font-light text-xs leading-relaxed mt-3">
            No website yet — the photographs and the short film are the tour for now.
          </p>
          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start label label-xs text-cream/90 mt-auto pt-5 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              <span className="border-b border-gold/60 pb-1">Open in Maps ↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
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

  const linked = properties.filter((p) => p.url);
  const unlinked = properties.filter((p) => !p.url);

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
        className="relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-forest border border-white/15 shadow-[0_60px_140px_rgba(0,0,0,0.7)] p-6 md:p-9"
      >
        <p className="label text-gold">{title}</p>
        <h3 className="font-display text-2xl md:text-[32px] leading-tight text-cream mt-2">
          Which of our resorts?
        </h3>
        <p className="text-cream/65 font-light text-sm md:text-base mt-2">
          {properties.length} resorts in Kerala
          {unlinked.length
            ? ` — ${linked.length} with their own sites, and the newest below.`
            : ", each with its own site."}
        </p>

        {/* the two with sites: a pair of link cards, as before */}
        <div className="grid sm:grid-cols-2 gap-4 md:gap-5 mt-7">
          {linked.map((p, i) => (
            <a
              key={p.name}
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

        {/* the one without a site: full width, photographs and an address in
            place of a link — the layout says "look", not "go" */}
        {unlinked.map((p) => (
          <UnlinkedProperty key={p.name} p={p} />
        ))}

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
