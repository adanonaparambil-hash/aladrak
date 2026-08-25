"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OMAN_VIEW, OMAN_PATHS, MAP_PINS, type MapPin } from "@/lib/oman-geo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven map journey. The section pins while the camera flies from
 * Musandam to Dhofar — each stop zooms into a region, its pins light up with
 * labels, and a parallax card lists every project on that stretch of coast.
 */

type Stop = {
  id: string;
  title: string;
  sub: string;
  places: string[]; // MAP_PINS place names in this stop
  cx: number;
  cy: number;
  s: number; // camera zoom
};

const STOPS: Stop[] = [
  { id: "musandam", title: "Musandam", sub: "The northern exclave", places: ["Khasab"], cx: 540, cy: 105, s: 3.4 },
  { id: "batinah", title: "Al Batinah & Al Buraymi", sub: "The industrial coast", places: ["Shinas", "Liwa", "Suhar", "Saham", "Al Buraymi"], cx: 560, cy: 290, s: 2.9 },
  { id: "muscat", title: "Muscat", sub: "The capital portfolio", places: ["Muscat", "Ar Rustaq"], cx: 745, cy: 405, s: 3.1 },
  { id: "interior", title: "The Interior", sub: "Ad Dakhliyyah · Adh Dhahirah · Ash Sharqiyyah", places: ["Yanqul", "Ibri", "Nizwa", "Ibra", "Bidiyyah", "Ras Al Hadd"], cx: 740, cy: 470, s: 2.2 },
  { id: "wusta", title: "Al Wusta", sub: "The desert corridor", places: ["Mahout", "Masirah", "Hayma", "Ad Duqm"], cx: 700, cy: 830, s: 2.3 },
  { id: "dhofar", title: "Dhofar", sub: "The southern frontier", places: ["Nimr", "Mirbat"], cx: 430, cy: 1140, s: 2.4 },
  { id: "oman", title: "All of Oman", sub: "One national footprint", places: [], cx: 500, cy: 660, s: 1 },
];

/**
 * Label placement — a cartographic leader ladder, precomputed per region.
 *
 * Stacking labels above their own dots does not work here: the Batinah pins run
 * diagonally down the coast a few units apart, so any per-pin offset either
 * overlaps them or (if the offset grows southward) drags every label up into the
 * northern ones. Both were tried and measured.
 *
 * Instead each region gets a LADDER: evenly spaced label slots on one side of
 * that region's camera centre, ordered north-to-south to match the pins, with a
 * leader drawn from each slot back to its dot. Slots are a fixed SLOT apart and
 * a label is ~13 tall, so separation is guaranteed at any zoom — and because the
 * order is preserved, the leaders fan without crossing.
 */
const SLOT = 30;
const LADDER = 105;
const ELBOW = 20;

type Annot = { d: string; tx: number; ty: number; anchor: "start" | "end" };
const ANNOT = new Map<string, Annot>();
{
  const byPlace = new Map(MAP_PINS.map((mp) => [mp.place, mp] as const));
  STOPS.forEach((st) => {
    const pins = st.places
      .map((pl) => byPlace.get(pl))
      .filter((x): x is MapPin => !!x)
      .sort((l, r) => l.y - r.y);
    if (!pins.length) return;
    const dir = st.cx > OMAN_VIEW.w * 0.5 ? -1 : 1;
    const railX = st.cx + dir * LADDER;
    pins.forEach((pin, k) => {
      const ty = st.cy + (k - (pins.length - 1) / 2) * SLOT;
      ANNOT.set(pin.place, {
        d: `M${railX} ${ty} L${railX - dir * ELBOW} ${ty} L${pin.x} ${pin.y}`,
        tx: railX + dir * 6,
        ty,
        anchor: dir > 0 ? "start" : "end",
      });
    });
  });
}

export default function OmanMap() {
  const section = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const camG = useRef<SVGGElement>(null);
  const mapWrap = useRef<HTMLDivElement>(null);
  const callout = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const [stopIdx, setStopIdx] = useState(0);
  /** the pin the visitor clicked, if any */
  const [sel, setSel] = useState<MapPin | null>(null);
  const selRef = useRef<MapPin | null>(null);
  /** re-anchors the callout to its dot; called every camera frame */
  const reposition = useRef<() => void>(() => {});

  const pinsByPlace = useMemo(() => {
    const m = new Map<string, MapPin>();
    MAP_PINS.forEach((p) => m.set(p.place, p));
    return m;
  }, []);

  const { w, h } = OMAN_VIEW;

  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  /* keep the callout pinned to its dot, flipping below when it would clip out
     of the top of the map frame */
  useEffect(() => {
    const fn = () => {
      const pin = selRef.current;
      const wrap = mapWrap.current;
      const el = callout.current;
      const svg = svgRef.current;
      const tip = arrow.current;
      if (!pin || !wrap || !el || !svg || !tip) return;
      const dot = svg.querySelector<SVGGraphicsElement>(
        `[data-hit="${CSS.escape(pin.place)}"]`
      );
      if (!dot) return;
      const dr = dot.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const x = dr.left + dr.width / 2 - wr.left;
      const above = dr.top - wr.top - 14;
      const flip = above - el.offsetHeight < 0;
      el.style.left = `${x}px`;
      el.style.top = flip ? `${dr.bottom - wr.top + 14}px` : `${above}px`;
      el.style.transform = flip ? "translate(-50%, 0)" : "translate(-50%, -100%)";
      tip.style.top = flip ? "-7px" : "auto";
      tip.style.bottom = flip ? "auto" : "-7px";
      tip.style.borderWidth = flip ? "1px 0 0 1px" : "0 1px 1px 0";
    };
    reposition.current = fn;
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [sel]);

  /* open animation + escape to dismiss */
  useEffect(() => {
    if (!sel || !callout.current) return;
    gsap.fromTo(
      callout.current,
      { autoAlpha: 0, scale: 0.94 },
      { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  useEffect(() => {
    const root = section.current;
    const svg = svgRef.current;
    const g = camG.current;
    if (!root || !svg || !g) return;

    const ctx = gsap.context(() => {
      const cam = { s: 1, cx: w / 2, cy: h / 2 };
      const apply = () => {
        g.setAttribute(
          "transform",
          `translate(${w / 2} ${h / 2}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`
        );
        // the dot moves under the camera, so the callout has to follow it
        reposition.current();
      };
      apply();

      const outline = svg.querySelectorAll<SVGPathElement>("[data-outline]");
      outline.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
      });
      gsap.set(svg.querySelectorAll("[data-pin]"), { scale: 0, transformOrigin: "center" });
      gsap.set(svg.querySelectorAll("[data-lbl]"), { opacity: 0 });
      // leaders draw themselves in; opacity carries the arrowhead with the line
      svg.querySelectorAll<SVGPathElement>("[data-leader]").forEach((l) => {
        const len = l.getTotalLength();
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      });
      const cards = root.querySelectorAll<HTMLElement>("[data-stopcard]");
      gsap.set(cards, { autoAlpha: 0, y: 90 });

      let lastIdx = -1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          /**
           * 80% of a screen per region, not 110%.
           *
           * At 110 the map held the page for 7.7 screens — the longest pin on
           * the site by half again, for content that is a slow pan across an
           * outline. Past a point a scrollytelling pin stops reading as
           * storytelling and starts reading as a section that will not end,
           * which is how it was reported: blank dark space after the map.
           */
          end: `+=${STOPS.length * 80}%`,
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          onUpdate: (st) => {
            const t = st.progress * tl.duration();
            let i = 0;
            for (let k = 0; k < STOPS.length; k++) {
              if (t >= tl.labels[`stop${k}`] + 0.45) i = k;
            }
            if (i !== lastIdx) {
              lastIdx = i;
              setStopIdx(i);
              // travelling on drops any open callout — its dot is leaving frame
              setSel(null);
            }
          },
        },
      });

      /**
       * The country draws itself on APPROACH, not inside the scrubbed timeline.
       *
       * It used to be the first ~0.9s of a ~17s timeline — about 5% of a
       * 7-screen pin, i.e. the first ~400px of scroll. So arriving at the
       * section showed a screen of empty black before anything appeared, which
       * read as broken rather than as an entrance. Firing it once on approach
       * means the map is already there when the pin takes hold.
       */
      gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      })
        .to(outline, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.05 })
        .to(outline, { fillOpacity: 1, duration: 0.6 }, "-=0.6")
        .to(
          svg.querySelectorAll("[data-pin]"),
          { scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.02 },
          "-=0.45"
        );

      STOPS.forEach((stop, i) => {
        const at = `stop${i}`;
        tl.addLabel(at);
        // camera flight
        tl.to(cam, { s: stop.s, cx: stop.cx, cy: stop.cy, duration: 1, ease: "power1.inOut", onUpdate: apply }, at);
        // labels of this stop in — previous stop's out
        // "" places means the finale, where every annotation lights up
        const pick = (places: string[], attr: string) =>
          svg.querySelectorAll(
            places.length
              ? places.map((pl) => `[${attr}="${CSS.escape(pl)}"]`).join(",")
              : `[${attr}]`
          );
        if (i > 0 && STOPS[i - 1].places.length) {
          tl.to(pick(STOPS[i - 1].places, "data-lbl"), { opacity: 0, duration: 0.35 }, at);
          tl.to(pick(STOPS[i - 1].places, "data-leader"), { opacity: 0, duration: 0.35 }, at);
        }
        // the arrow reaches for the dot first, the name lands on it after
        tl.to(
          pick(stop.places, "data-leader"),
          { opacity: 1, strokeDashoffset: 0, duration: 0.55, stagger: 0.05, ease: "power2.out" },
          `${at}+=0.35`
        );
        tl.to(pick(stop.places, "data-lbl"), { opacity: 1, duration: 0.5, stagger: 0.04 }, `${at}+=0.5`);
        // parallax card
        tl.fromTo(cards[i], { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, `${at}+=0.35`);
        // hold to read
        tl.to({}, { duration: 0.9 });
        if (i < STOPS.length - 1) tl.to(cards[i], { autoAlpha: 0, y: -70, duration: 0.4, ease: "power2.in" });
      });
    }, root);

    return () => ctx.revert();
  }, [w, h]);

  return (
    <section ref={section} className="relative bg-ink text-cream overflow-hidden">
      {/* A ground with depth rather than flat near-black: a deep green-to-ink
          diagonal, then two ambient glows over it. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #10271a 0%, #0b1410 38%, #0a0f0c 62%, #14301f 100%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-40 w-[620px] h-[620px] rounded-full bg-gold/[0.09] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[680px] h-[680px] rounded-full bg-brand/25 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-forest/35 blur-[160px]" />

      <div className="relative h-[100dvh] flex flex-col">
        {/* header */}
        <div className="flex items-end justify-between gap-4 px-6 md:px-14 pt-8 md:pt-10 pb-2 flex-none">
          <div>
            <p className="label text-gold mb-2.5">Prime Project Locations</p>
            <h3 className="font-display text-2xl md:text-4xl">From Musandam to Dhofar</h3>
          </div>
          {/* progress rail */}
          <div className="hidden lg:flex items-center gap-3">
            {STOPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span
                  className={`label label-xs transition-colors duration-300 ${
                    i === stopIdx ? "text-gold" : "text-cream/30"
                  }`}
                >
                  {s.title}
                </span>
                {i < STOPS.length - 1 && <span className="w-5 h-px bg-cream/15" />}
              </div>
            ))}
          </div>
        </div>

        {/* map + cards */}
        <div className="relative flex-1 min-h-0 grid lg:grid-cols-5 gap-0 px-4 md:px-14 pb-6">
          <div ref={mapWrap} className="relative lg:col-span-3 min-h-0">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${w} ${h}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="group"
              aria-label="Al Adrak project locations across Oman"
            >
              <defs>
                <linearGradient id="omanFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(200,169,107,0.15)" />
                  <stop offset="55%" stopColor="rgba(31,61,42,0.4)" />
                  <stop offset="100%" stopColor="rgba(200,169,107,0.08)" />
                </linearGradient>
                <marker
                  id="leadArrow"
                  viewBox="0 0 10 10"
                  refX="8.5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 Z" fill="#C8A96B" />
                </marker>
              </defs>
              <g ref={camG}>
                {OMAN_PATHS.map((d, i) => (
                  <path
                    key={i}
                    data-outline
                    d={d}
                    fill="url(#omanFill)"
                    stroke="rgba(200,169,107,0.8)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {MAP_PINS.map((p) => {
                  const A =
                    ANNOT.get(p.place) ??
                    ({ d: `M${p.x} ${p.y - 26} L${p.x} ${p.y}`, tx: p.x, ty: p.y - 32, anchor: "start" } as Annot);
                  const picked = sel?.place === p.place;
                  return (
                    <g key={p.place}>
                      {/* the annotation arrow — drawn in when its region arrives */}
                      <path
                        data-leader={p.place}
                        d={A.d}
                        fill="none"
                        stroke="rgba(200,169,107,0.8)"
                        strokeWidth="1.1"
                        markerEnd="url(#leadArrow)"
                      />
                      <g data-pin style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="7"
                          fill="rgba(200,169,107,0.3)"
                          className="animate-ping"
                          style={{
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            animationDuration: "2.6s",
                            animationDelay: `${(p.x + p.y) % 1.9}s`,
                          }}
                        />
                        <circle cx={p.x} cy={p.y} r="4.5" fill="#C8A96B" stroke="#0E1B13" strokeWidth="1.5" />
                      </g>
                      {picked && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="12"
                          fill="none"
                          stroke="#C8A96B"
                          strokeWidth="1.2"
                          opacity="0.9"
                        />
                      )}
                      <text
                        data-lbl={p.place}
                        x={A.tx}
                        y={A.ty}
                        textAnchor={A.anchor}
                        dominantBaseline="middle"
                        fontSize="17"
                        className="fill-cream"
                        style={{ paintOrder: "stroke", stroke: "rgba(14,27,19,0.9)", strokeWidth: 4 }}
                      >
                        {p.place}
                      </text>
                      {/* a generous invisible hit target — the dot itself is 4.5r */}
                      <circle
                        data-hit={p.place}
                        cx={p.x}
                        cy={p.y}
                        r="17"
                        fill="transparent"
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`${p.place}: ${p.projects.length} project${p.projects.length === 1 ? "" : "s"}`}
                        onClick={() => setSel((prev) => (prev?.place === p.place ? null : p))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSel((prev) => (prev?.place === p.place ? null : p));
                          }
                        }}
                      >
                        <title>{p.projects.join(" · ")}</title>
                      </circle>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* clicked-site callout — anchored to its dot, arrow pointing at it */}
            {sel && (
              <div
                ref={callout}
                className="absolute z-30 w-[min(320px,74vw)]"
                style={{ left: 0, top: 0, transform: "translate(-50%, -100%)" }}
                role="dialog"
                aria-label={`${sel.place} projects`}
              >
                <div className="relative rounded-xl border border-gold/40 bg-ink/95 px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
                  <button
                    onClick={() => setSel(null)}
                    aria-label="Close"
                    className="absolute top-2.5 right-3 text-cream/45 hover:text-gold transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                  <p className="label text-gold mb-1.5">{sel.gov}</p>
                  <h5 className="font-display text-xl mb-3 pr-5">{sel.place}</h5>
                  <ul className="space-y-2">
                    {sel.projects.map((pr) => (
                      <li key={pr} className="flex items-start gap-2.5">
                        <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-gold flex-none" />
                        <span className="text-[clamp(0.84375rem,0.6vw,1rem)] leading-snug text-cream/85 font-light">
                          {pr}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span
                    ref={arrow}
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-ink/95 border-gold/40"
                    style={{ bottom: "-7px", borderWidth: "0 1px 1px 0" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* stop cards — parallax overlay */}
          <div className="relative lg:col-span-2 min-h-0 pointer-events-none">
            {STOPS.map((stop) => {
              const sites =
                stop.places.length === 0
                  ? []
                  : stop.places.flatMap((pl) => {
                      const pin = pinsByPlace.get(pl)!;
                      return pin.projects.map((pr) => ({ pr, pl: pin.place }));
                    });
              return (
                <div
                  key={stop.id}
                  data-stopcard
                  className="absolute inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center"
                >
                  <div className="w-full max-h-[42dvh] lg:max-h-[70dvh] overflow-hidden rounded-2xl border border-cream/12 bg-ink/70 backdrop-blur-xl p-6 md:p-9 shadow-[0_35px_80px_rgba(0,0,0,0.5)]">
                    <p className="label text-gold mb-2">{stop.sub}</p>
                    <h4 className="font-display text-2xl md:text-4xl mb-5">{stop.title}</h4>
                    {sites.length > 0 ? (
                      <ul
                        className={`gap-x-8 ${
                          sites.length > 8 ? "columns-2" : ""
                        }`}
                      >
                        {sites.map(({ pr, pl }) => (
                          <li key={pr} className="flex items-start gap-3 py-[7px] break-inside-avoid">
                            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-gold flex-none" />
                            <span className="text-cream/85 font-light text-[clamp(0.84375rem,0.8vw,1.125rem)] leading-snug">
                              {pr}
                              <span className="text-cream/70"> — {pl}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex gap-10 mt-2">
                        <div>
                          <p className="font-display text-4xl md:text-5xl text-gold">{MAP_PINS.length}</p>
                          <p className="label label-xs text-cream/75 mt-2">Pinned Locations</p>
                        </div>
                        <div>
                          <p className="font-display text-4xl md:text-5xl text-gold">
                            {MAP_PINS.reduce((n, p) => n + p.projects.length, 0)}
                          </p>
                          <p className="label label-xs text-cream/40 mt-2">Sites on the Map</p>
                        </div>
                        <div>
                          <p className="font-display text-4xl md:text-5xl text-gold">11</p>
                          <p className="label label-xs text-cream/40 mt-2">Governorates</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* scroll hint */}
        <p className="label label-xs text-cream/30 text-center pb-4 flex-none lg:hidden">
          Keep scrolling to travel the map
        </p>
      </div>
    </section>
  );
}
