"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./SmoothScroll";
import { motionOK } from "@/lib/intro";
import { leadership } from "@/lib/content";
import { currentYear, FOUNDED, yearsWord } from "@/lib/anniversary";

gsap.registerPlugin(ScrollTrigger);

/**
 * The arrival — forty years told as the loading itself.
 *
 * This borrows the history section's year-wheel as the entrance: all 41 years
 * from 1986 to 2026 ride a dotted arc pivoted off the left edge of the screen,
 * and loading sweeps the wheel through them. The years ARE the progress — 1986
 * is 0%, 2026 is 100% — so the wait reads as Al Adrak's legacy passing rather
 * than as a spinner, and it previews the section it belongs to.
 *
 * Two deliberate departures from that section:
 *   - Every year is counter-rotated back to upright. In the history section the
 *     off-axis rows keep the wheel's rotation and their text renders diagonally,
 *     which reads as a broken layout rather than as depth.
 *   - The arc and its year ticks are drawn on canvas instead of using the
 *     circle-dots SVGs, whose dots scale with the ring and become 9px blobs at
 *     this radius. Canvas keeps them fine and lets the spine be genuinely dense.
 *
 * The hero underneath starts on its own and is never gated on this component,
 * so a failure here can only cost the animation, never the page.
 */

const START_YEAR = FOUNDED;
/** the wheel sweeps to the present, so it never stops short of today */
const END_YEAR = currentYear();
const SPAN = END_YEAR - START_YEAR; // 40
/**
 * Degrees per year. The arc's radius is capped by the viewport width (the year
 * text starts at the radius and runs rightward), so on a narrow screen the only
 * way to keep 5deg from stacking the labels on top of each other is to open the
 * pitch up. 5deg puts ~14 years on a desktop arc; 8deg puts ~9 on a phone.
 */
const STEP_WIDE = 5;
const STEP_NARROW = 8;
/**
 * How far off the axis a year is still drawn. A phone is tall relative to the
 * arc radius it can afford, so it shows a wider sweep to fill the height; a
 * desktop at 34deg already spans the full 900px.
 */
const CULL_WIDE = 34;
const CULL_NARROW = 44;
/** the sweep always takes at least this long, however fast the film buffers */
const MIN_SWEEP = 3200;
const SEEN_SWEEP = 1200;
const LAND_HOLD = 700;
const MAX_WAIT = 9000;
const SEEN_KEY = "adrak-intro-seen";

/**
 * The dotted field: radius factor, angular pitch in degrees, dot radius, alpha.
 * Nine concentric arcs make it read as a dense survey field rather than a lone
 * dotted line — but nothing sits between 0.94 and 1.06, which is the channel the
 * year text occupies. Dots crossing the years is what made the first pass look
 * cluttered.
 */
const ARCS = [
  { r: 0.62, pitch: 2.0, dot: 1.0, a: 0.12 },
  { r: 0.7, pitch: 1.8, dot: 1.0, a: 0.16 },
  { r: 0.78, pitch: 1.6, dot: 1.1, a: 0.2 },
  { r: 0.86, pitch: 1.4, dot: 1.1, a: 0.25 },
  { r: 0.93, pitch: 1.2, dot: 1.2, a: 0.32 },
  { r: 1.07, pitch: 1.0, dot: 1.4, a: 0.62 },
  { r: 1.13, pitch: 1.2, dot: 1.2, a: 0.46 },
  { r: 1.19, pitch: 1.5, dot: 1.1, a: 0.32 },
  { r: 1.26, pitch: 1.9, dot: 1.0, a: 0.22 },
  { r: 1.34, pitch: 2.2, dot: 1.0, a: 0.16 },
  { r: 1.45, pitch: 2.6, dot: 1.0, a: 0.12 },
  { r: 1.57, pitch: 3.0, dot: 1.0, a: 0.09 },
];

/**
 * The receding ring tunnel behind everything — the history section's own
 * background device. Rings of dots drift toward the viewer and are projected by
 * FOCAL/z, so they swell and fade. Centred on the reading axis, so the years
 * appear to arrive out of it.
 */
const TUNNEL = {
  rings: 14,
  ringsNarrow: 8,
  perRing: 44,
  perRingNarrow: 30,
  spacing: 460,
  depth: 1500,
  focal: 520,
  baseR: 265,
  speed: 150, // world units per second
  alpha: 0.3,
};

const YEARS = Array.from({ length: SPAN + 1 }, (_, i) => START_YEAR + i);

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const RAD = Math.PI / 180;

export default function IntroLoader() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [gone, setGone] = useState(false);
  const [landed, setLanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const axis = useRef<HTMLDivElement>(null);
  const wheelWrap = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const exitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!onHome) return;
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const html = document.documentElement;
    const lenis = getLenis();
    const calm = !motionOK();

    const seen = (() => {
      try {
        return sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {
        return false;
      }
    })();

    html.classList.add("is-intro");
    lenis?.stop();
    window.scrollTo(0, 0);

    /* ---------- layout ---------- */
    let vw = 0;
    let vh = 0;
    let radius = 0;
    let step = STEP_WIDE;
    let maxScale = 1;
    let cull = CULL_WIDE;
    /** the arc's centre — lifted on a phone, where the quote sits beneath it */
    let cy = 0;
    const layout = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      cv.style.width = vw + "px";
      cv.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the arc's radius from a pivot at the left edge, vertical centre
      const narrow = vw < 640;
      radius = narrow ? vw * 0.7 : Math.min(vw * 0.47, 820);
      step = narrow ? STEP_NARROW : STEP_WIDE;
      // the phone's base type is smaller, so the axis year is scaled up past 1
      maxScale = narrow ? 1.45 : 1;
      cull = narrow ? CULL_NARROW : CULL_WIDE;
      cy = narrow ? vh * 0.4 : vh * 0.5;
      if (wheelWrap.current) wheelWrap.current.style.top = `${cy}px`;
      if (axis.current) axis.current.style.top = `${cy}px`;
      // rows are pre-rotated once; only the wheel and the labels move
      for (let i = 0; i <= SPAN; i++) {
        const row = rows.current[i];
        if (row) row.style.transform = `rotate(${i * step}deg)`;
        const lb = labels.current[i];
        if (lb) lb.style.left = `${radius}px`;
      }
      if (axis.current) axis.current.style.left = `${radius - 54}px`;
    };
    layout();

    /* ---------- one frame ---------- */
    const render = (p: number, tSec: number) => {
      const rot = -p * SPAN * step;
      // the dot field is drawn a little wider than the years, and fades out
      // across that margin so nothing pops in at the edge of the sweep
      const fadeSpan = cull + 12;
      const band = cull + 14;

      ctx.clearRect(0, 0, vw, vh);
      const narrow = vw < 640;

      /* the ring tunnel, behind everything — one fill per ring */
      const nRings = narrow ? TUNNEL.ringsNarrow : TUNNEL.rings;
      const perRing = narrow ? TUNNEL.perRingNarrow : TUNNEL.perRing;
      const drift = tSec * TUNNEL.speed;
      for (let k = 0; k < nRings; k++) {
        let z = (k * TUNNEL.spacing - drift) % TUNNEL.depth;
        if (z < 0) z += TUNNEL.depth;
        if (z < 60) continue;
        const proj = TUNNEL.focal / z;
        const rr = TUNNEL.baseR * proj;
        if (rr > Math.hypot(vw, vh)) continue;
        // brightest mid-depth, gone at both ends, so nothing pops in or out
        const fz = z / TUNNEL.depth;
        const alpha = Math.sin(Math.PI * fz) * TUNNEL.alpha;
        if (alpha <= 0.01) continue;
        const dotR = Math.max(0.6, Math.min(2.6, 1.7 * proj));
        // each ring counter-spins, as the history section's tunnel does
        const spin = tSec * (k % 2 === 0 ? 0.09 : -0.09) + k * 0.13;
        ctx.beginPath();
        for (let j = 0; j < perRing; j++) {
          const a = (j / perRing) * Math.PI * 2 + spin;
          const x = radius + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          ctx.moveTo(x + dotR, y);
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(245,242,234,${alpha})`;
        ctx.fill();
      }

      /* the dotted spine, swept past the axis. Alpha varies per dot, so the
         fade is quantised into buckets and each bucket filled once — a fill per
         dot was ~700 draw calls a frame before the tunnel was added. */
      const BUCKETS = 6;
      for (const arc of ARCS) {
        const rr = radius * arc.r;
        const from = Math.ceil((-rot - band) / arc.pitch) * arc.pitch;
        for (let b = 0; b < BUCKETS; b++) {
          const lo = b / BUCKETS;
          const hi = (b + 1) / BUCKETS;
          let opened = false;
          for (let w = from; w <= -rot + band; w += arc.pitch) {
            const sAng = w + rot;
            const fade = 1 - Math.min(1, Math.abs(sAng) / fadeSpan);
            if (fade <= 0.02 || fade < lo || fade >= hi) continue;
            if (!opened) {
              ctx.beginPath();
              opened = true;
            }
            const a = sAng * RAD;
            const x = Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;
            ctx.moveTo(x + arc.dot, y);
            ctx.arc(x, y, arc.dot, 0, Math.PI * 2);
          }
          if (opened) {
            ctx.fillStyle = `rgba(245,242,234,${arc.a * ((lo + hi) / 2)})`;
            ctx.fill();
          }
        }
      }
      // a tick for every year of the span, decades heavier
      for (let i = 0; i <= SPAN; i++) {
        const s = i * step + rot;
        if (Math.abs(s) > fadeSpan) continue;
        const fade = 1 - Math.min(1, Math.abs(s) / fadeSpan);
        const decade = (START_YEAR + i) % 10 === 0;
        const a = s * RAD;
        const rr = radius * 0.985;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, cy + Math.sin(a) * rr, decade ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = decade
          ? `rgba(201,155,69,${0.9 * fade})`
          : `rgba(216,201,163,${0.55 * fade})`;
        ctx.fill();
      }

      // the years themselves — upright on the arc, biggest on the axis
      let nearest = 0;
      let nearestD = Infinity;
      for (let i = 0; i <= SPAN; i++) {
        const lb = labels.current[i];
        if (!lb) continue;
        const s = i * step + rot;
        const a = Math.abs(s);
        if (a < nearestD) {
          nearestD = a;
          nearest = i;
        }
        if (a > cull) {
          if (lb.style.opacity !== "0") lb.style.opacity = "0";
          continue;
        }
        const d = a / cull;
        const near = Math.pow(1 - d, 2.2);
        // counter-rotate by the row AND wheel rotation, so the year stays upright
        lb.style.transform = `translateY(-50%) rotate(${-s}deg) scale(${lerp(0.34, maxScale, near)})`;
        lb.style.opacity = `${Math.pow(1 - d, 1.45)}`;
      }
      for (let i = 0; i <= SPAN; i++) {
        const lb = labels.current[i];
        if (lb) lb.style.color = i === nearest ? "#f5f2ea" : "#d8c9a3";
      }

      // the wheel carries the rows; the labels above undo it to stay readable
      for (let i = 0; i <= SPAN; i++) {
        const row = rows.current[i];
        if (row) row.style.transform = `rotate(${i * step + rot}deg)`;
      }

      if (bar.current) bar.current.style.width = `${p * 100}%`;
    };

    let killed = false;
    const timers: number[] = [];
    let raf = 0;

    /* ---------- reduced motion: landed on 2026, all content present ---------- */
    if (calm) {
      render(1, 0);
      setLanded(true);
      timers.push(
        window.setTimeout(
          () => {
            if (killed) return;
            killed = true;
            html.classList.remove("is-intro");
            lenis?.start();
            ScrollTrigger.refresh();
            gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: () => setGone(true) });
          },
          seen ? 600 : 1900
        )
      );
      const onResizeCalm = () => {
        layout();
        render(1, 0);
      };
      window.addEventListener("resize", onResizeCalm);
      return () => {
        killed = true;
        timers.forEach(clearTimeout);
        window.removeEventListener("resize", onResizeCalm);
        html.classList.remove("is-intro");
        lenis?.start();
      };
    }

    /* ---------- sweep, paced by the film's readiness ---------- */
    const heroVids = Array.from(
      document.querySelectorAll<HTMLVideoElement>("video[data-hero-video]")
    );
    const wide = window.matchMedia("(min-width: 640px)").matches;
    const heroActive =
      heroVids.find((v) => v.dataset.heroVideo === (wide ? "web" : "mobile")) ?? heroVids[0];

    // readiness, not buffered fraction: a 30MB film is playable long before
    // buffered/duration approaches 1, so gating on the fraction never lands
    let filmReady = !heroActive;
    if (heroActive) {
      if (heroActive.readyState >= 3) filmReady = true;
      else {
        const ok = () => {
          filmReady = true;
        };
        heroActive.addEventListener("canplay", ok, { once: true });
        heroActive.addEventListener("canplaythrough", ok, { once: true });
        heroActive.addEventListener("error", ok, { once: true }); // never strand
      }
    }

    const startedAt = performance.now();
    const sweepMs = seen ? SEEN_SWEEP : MIN_SWEEP;
    let target = 0;
    let shown = 0;
    let landedFlag = false;

    const frame = (now: number) => {
      if (killed) return;
      const elapsed = now - startedAt;
      const ramp = easeOutCubic(clamp01(elapsed / sweepMs));
      // hold just short of 2026 until the film can actually play
      const next = Math.min(ramp, filmReady ? 1 : 0.88);
      if (next > target) target = next;
      shown += (target - shown) * 0.1;
      if (target - shown < 0.0015) shown = target;
      render(shown, elapsed / 1000);

      if (!landedFlag && shown >= 1 && elapsed >= sweepMs) {
        landedFlag = true;
        setLanded(true);
        timers.push(window.setTimeout(() => exit(), LAND_HOLD));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    // hard ceiling: a slow connection must never trap anyone here
    timers.push(window.setTimeout(() => exit(), MAX_WAIT));

    /* ---------- exit: dissolve onto the hero, already running beneath ---------- */
    const exit = () => {
      if (killed) return;
      killed = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* private mode */
      }
      gsap
        .timeline()
        .to(
          el.querySelectorAll("[data-intro-fade]"),
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          0
        )
        // the arc drifts on as it dissolves, so the reveal carries momentum
        .to([cv, ...rows.current.filter(Boolean)], { scale: 1.05, duration: 0.9, ease: "power2.in" }, 0)
        .add(() => {
          html.classList.remove("is-intro");
          lenis?.start();
          ScrollTrigger.refresh();
        }, 0.25)
        .to(el, { autoAlpha: 0, duration: 0.62, ease: "power2.inOut" }, 0.18)
        .add(() => {
          cancelAnimationFrame(raf);
          setGone(true);
        }, 0.95);
    };

    exitRef.current = exit;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      html.classList.remove("is-intro");
      lenis?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHome]);

  if (!onHome || gone) return null;

  return (
    <div ref={root} className="intro-root" role="status" aria-live="polite">
      {/* the history section's own ground and glow, so this reads as its prologue */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse farthest-corner at 40% 50%, rgba(170,151,93,0.26) 0%, rgba(10,15,12,0) 70%)",
        }}
      />

      {/* the dotted spine and the forty year ticks */}
      <canvas ref={canvas} aria-hidden className="absolute inset-0 w-full h-full" />

      {/* the years, pivoted off the left edge */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={wheelWrap} className="absolute left-0 top-1/2 w-0 h-0">
          {YEARS.map((y, i) => (
            <div
              key={y}
              ref={(n) => {
                rows.current[i] = n;
              }}
              className="absolute left-0 top-0 w-0 h-0 will-change-transform"
              style={{ transformOrigin: "0px 0px" }}
            >
              <span
                ref={(n) => {
                  labels.current[i] = n;
                }}
                className="absolute top-0 font-display leading-none whitespace-nowrap text-[6vw] sm:text-[3.2vw]"
                style={{ opacity: 0, transformOrigin: "0% 50%" }}
              >
                {y}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* the axis — whichever year crosses it is the one being read */}
      <div
        ref={axis}
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 h-px w-9 bg-gold/70"
      />

      {/* the name itself, not a text stand-in for it */}
      <div data-intro-fade className="absolute top-6 left-7 sm:top-8 sm:left-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Al Adrak"
          className="w-[150px] sm:w-[min(20vw,300px)] h-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
        />
      </div>

      {/* the founder's own words — his company is what the years are counting */}
      <figure
        data-intro-fade
        className="absolute z-10 px-7 text-center sm:text-left
                   inset-x-0 bottom-[19vh] sm:inset-x-auto sm:bottom-auto
                   sm:right-[5vw] sm:top-1/2 sm:-translate-y-1/2 sm:w-[26vw] sm:max-w-[380px] sm:px-0"
      >
        <span aria-hidden className="hidden sm:block font-display text-gold text-5xl leading-none">
          &rdquo;
        </span>
        <blockquote className="font-serifit italic text-cream/80 text-[clamp(1rem,1.15vw,1.75rem)] leading-snug sm:-mt-3">
          {leadership.founder.quote}
        </blockquote>
        <figcaption className="label label-xs text-sand/65 mt-4 sm:mt-6">
          {leadership.founder.name}
          <span className="hidden sm:inline"> &middot; Founder</span>
        </figcaption>
      </figure>

      <div
        data-intro-fade
        className="absolute inset-x-0 bottom-[6vh] flex flex-col items-center px-6 text-center"
      >
        <p
          className={`label label-xs text-gold mb-4 transition-opacity duration-700 ${
            landed ? "opacity-100" : "opacity-0"
          }`}
        >
          {yearsWord()} years of landmarks
        </p>
        <div className="w-full max-w-[260px] sm:max-w-sm">
          <div className="h-px w-full bg-cream/12">
            <div ref={bar} className="h-px bg-gold" style={{ width: "0%" }} />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="label label-xs text-cream/35">{START_YEAR}</span>
            <span className="label label-xs text-cream/35">{END_YEAR}</span>
          </div>
        </div>
      </div>

      <button
        data-intro-fade
        onClick={() => exitRef.current?.()}
        className="absolute top-6 right-6 px-5 py-2.5 rounded-full border border-cream/20 label label-xs text-cream/60 hover:text-ink hover:bg-sand hover:border-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand transition-colors duration-300"
      >
        Skip
      </button>
    </div>
  );
}
