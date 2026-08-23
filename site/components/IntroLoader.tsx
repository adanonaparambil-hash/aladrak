"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./SmoothScroll";
import { motionOK } from "@/lib/intro";
import { leadership } from "@/lib/content";
import { asset } from "@/lib/asset";
import { currentYear, FOUNDED, years } from "@/lib/anniversary";

gsap.registerPlugin(ScrollTrigger);

/**
 * The arrival — the anniversary counted out, 1986 to the present.
 *
 * The composition is a single centred dial: a glowing ring with the years
 * climbing through the middle of it, the founding year and the present held on
 * medallions either side, and a journey bar underneath tracking the same
 * progress. Loading IS the count — the sweep from 1986 to now is the loading
 * bar, so the wait reads as the company's history passing rather than as a
 * spinner.
 *
 * The years stack UPWARD only. The one being read sits on the centre line at
 * full size; the years already passed recede above it, each smaller and fainter
 * than the last, and nothing is drawn below — the future has not happened yet.
 * That is what makes it read as a count rather than as a list.
 *
 * Everything is derived from the founding year, so this needs no edit when the
 * anniversary rolls over; see lib/anniversary.ts.
 *
 * Two things are deliberately preserved from the previous pass:
 *   - the receding ring tunnel and the star field, the same background device
 *     the history section uses, so the intro reads as its prologue;
 *   - the pacing, which is gated on the hero film being *playable* rather than
 *     fully buffered — a 30MB film is playable long before buffered/duration
 *     approaches 1, so gating on the fraction never lands.
 *
 * The hero underneath starts on its own and is never gated on this component,
 * so a failure here can only cost the animation, never the page.
 */

const START_YEAR = FOUNDED;
const END_YEAR = currentYear();
const SPAN = END_YEAR - START_YEAR;
const YEARS = Array.from({ length: SPAN + 1 }, (_, i) => START_YEAR + i);

/** the sweep always takes at least this long, however fast the film buffers */
const MIN_SWEEP = 3400;
const SEEN_SWEEP = 1300;
const LAND_HOLD = 900;
const MAX_WAIT = 9000;
const SEEN_KEY = "adrak-intro-seen";

/**
 * The upward stack. Spacing and size both decay geometrically with age, so the
 * column converges instead of running off the top of the screen: with DECAY
 * 0.86 the whole run of forty years occupies a finite ~7 rows of height, however
 * many years there are to show.
 */
const AGE_CULL = 9;
const DECAY = 0.86;

/** The receding tunnel of dot rings, centred on the dial. */
const TUNNEL = {
  rings: 14,
  ringsNarrow: 8,
  perRing: 44,
  perRingNarrow: 30,
  spacing: 460,
  depth: 1500,
  focal: 520,
  baseR: 265,
  speed: 150,
  alpha: 0.26,
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

type Star = { x: number; y: number; r: number; a: number; tw: number };

export default function IntroLoader() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [gone, setGone] = useState(false);
  const [landed, setLanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const dial = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const nowYear = useRef<HTMLSpanElement>(null);
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
    let cx = 0;
    let cy = 0;
    /** the dial's radius */
    let R = 0;
    /** type size of the year on the centre line */
    let fontPx = 0;
    /** spacing of the first step above the centre line */
    let gap = 0;
    let stars: Star[] = [];

    const layout = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      cv.style.width = vw + "px";
      cv.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = vw < 640;
      cx = vw / 2;
      // lifted on a phone, where the quote and the bar share the lower screen
      cy = narrow ? vh * 0.42 : vh * 0.5;
      R = clamp(Math.min(vw * 0.19, vh * 0.36), 118, 320);
      fontPx = clamp(R * 0.3, 30, 76);
      gap = fontPx * 0.62;

      if (dial.current) {
        dial.current.style.left = `${cx}px`;
        dial.current.style.top = `${cy}px`;
        dial.current.style.width = `${R * 2}px`;
        dial.current.style.height = `${R * 2}px`;
      }

      // the star field is regenerated per layout so density follows the viewport
      const count = narrow ? 70 : 150;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * vw,
        y: Math.random() * vh,
        r: 0.5 + Math.random() * 1.3,
        a: 0.18 + Math.random() * 0.5,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    layout();

    /* ---------- one frame ---------- */
    const render = (p: number, tSec: number) => {
      ctx.clearRect(0, 0, vw, vh);
      const narrow = vw < 640;

      /* the star field, drifting and breathing */
      for (const s of stars) {
        const tw = 0.65 + 0.35 * Math.sin(tSec * 0.9 + s.tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,242,234,${(s.a * tw).toFixed(3)})`;
        ctx.fill();
      }

      /* the receding tunnel of dot rings, centred on the dial */
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
        const alpha = Math.sin(Math.PI * (z / TUNNEL.depth)) * TUNNEL.alpha;
        if (alpha <= 0.01) continue;
        const dotR = Math.max(0.6, Math.min(2.6, 1.7 * proj));
        const spin = tSec * (k % 2 === 0 ? 0.09 : -0.09) + k * 0.13;
        ctx.beginPath();
        for (let j = 0; j < perRing; j++) {
          const a = (j / perRing) * Math.PI * 2 + spin;
          ctx.moveTo(cx + Math.cos(a) * rr + dotR, cy + Math.sin(a) * rr);
          ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, dotR, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(245,242,234,${alpha})`;
        ctx.fill();
      }

      /* the dial: a faint full circle, a dotted inner ring, and two bright
         crescents at the sides that carry the glow */
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201,155,69,0.20)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const innerR = R * 0.9;
      const dots = narrow ? 84 : 150;
      ctx.beginPath();
      for (let j = 0; j < dots; j++) {
        const a = (j / dots) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * innerR;
        const y = cy + Math.sin(a) * innerR;
        ctx.moveTo(x + 0.9, y);
        ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(216,201,163,0.30)";
      ctx.fill();

      // the crescents brighten as the count advances, so the dial fills with it
      const heat = 0.32 + 0.68 * p;
      const breathe = 0.85 + 0.15 * Math.sin(tSec * 1.1);
      ctx.save();
      ctx.shadowColor = "rgba(201,155,69,0.85)";
      ctx.shadowBlur = 26;
      ctx.strokeStyle = `rgba(228,190,110,${(0.85 * heat * breathe).toFixed(3)})`;
      ctx.lineWidth = 2.1;
      for (const mid of [0, Math.PI]) {
        ctx.beginPath();
        ctx.arc(cx, cy, R, mid - 0.62, mid + 0.62);
        ctx.stroke();
      }
      ctx.restore();

      /* the progress arc — the same count, drawn round the dial from the top */
      if (p > 0.001) {
        ctx.save();
        ctx.shadowColor = "rgba(201,155,69,0.6)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
        ctx.strokeStyle = "rgba(228,190,110,0.55)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      }

      /* the years: the one being counted on the centre line, the ones already
         passed receding above it, nothing below */
      const pos = p * SPAN;
      for (let i = 0; i <= SPAN; i++) {
        const lb = labels.current[i];
        if (!lb) continue;
        const age = pos - i; // >0 already passed, <0 not yet reached
        if (age < -0.5 || age > AGE_CULL) {
          if (lb.style.opacity !== "0") lb.style.opacity = "0";
          continue;
        }
        const a = Math.max(0, age);
        // geometric rise: spacing shrinks with age so the column converges
        const rise = (gap * (1 - Math.pow(DECAY, a))) / (1 - DECAY);
        const scale = 0.34 + 0.66 * Math.exp(-1.15 * a);
        // fade in from just below the line, so a year arrives rather than blinks
        const arriving = age < 0 ? 1 + age * 2 : 1;
        lb.style.transform = `translate(-50%,-50%) translateY(${(-rise).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        lb.style.opacity = `${(Math.exp(-0.42 * a) * clamp01(arriving)).toFixed(3)}`;
        lb.style.color = a < 0.5 ? "#f5f2ea" : "#d8c9a3";
      }

      if (bar.current) bar.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (nowYear.current) {
        nowYear.current.textContent = String(START_YEAR + Math.round(pos));
      }
    };

    let killed = false;
    const timers: number[] = [];
    let raf = 0;

    /* ---------- reduced motion: landed on the present, all content shown ---------- */
    if (calm) {
      render(1, 0);
      setLanded(true);
      // there is no animation frame here to re-measure in, so take one more
      // reading once layout has certainly happened
      timers.push(
        window.setTimeout(() => {
          if (killed) return;
          layout();
          render(1, 0);
        }, 80)
      );
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

    /* ---------- the count, paced by the film's readiness ---------- */
    const heroVids = Array.from(
      document.querySelectorAll<HTMLVideoElement>("video[data-hero-video]")
    );
    const wide = window.matchMedia("(min-width: 640px)").matches;
    const heroActive =
      heroVids.find((v) => v.dataset.heroVideo === (wide ? "web" : "mobile")) ?? heroVids[0];

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
      // Self-heal the measurements. A tab that is backgrounded or not yet laid
      // out at mount reports a zero viewport, which pins the dial to the corner
      // at its minimum radius and leaves it there, because nothing else would
      // re-measure until a resize that may never come. Comparing is cheap;
      // layout() only runs when the numbers actually changed.
      if (vw !== window.innerWidth || vh !== window.innerHeight) layout();
      const elapsed = now - startedAt;
      const ramp = easeOutCubic(clamp01(elapsed / sweepMs));
      // hold just short of the present until the film can actually play
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
        // the dial pushes forward as it dissolves, so the reveal carries momentum
        .to([cv, dial.current], { scale: 1.06, duration: 0.9, ease: "power2.in" }, 0)
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

  const n = years();

  return (
    <div ref={root} className="intro-root" role="status" aria-live="polite">
      {/* the ground glow the whole composition sits in */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse farthest-corner at 50% 50%, rgba(170,151,93,0.22) 0%, rgba(10,15,12,0) 68%)",
        }}
      />

      {/* stars, tunnel, dial, progress arc */}
      <canvas ref={canvas} aria-hidden className="absolute inset-0 w-full h-full" />

      {/* the dial's contents — sized and placed from layout() so the canvas and
          the DOM agree on where the centre is at every viewport */}
      <div
        ref={dial}
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        {/* the years, stacked upward from the centre line */}
        <div className="absolute left-1/2 top-1/2">
          {YEARS.map((y, i) => (
            <span
              key={y}
              ref={(el) => {
                labels.current[i] = el;
              }}
              className="absolute left-0 top-0 font-display leading-none whitespace-nowrap tabular-nums"
              style={{
                opacity: 0,
                fontSize: "clamp(1.9rem,4.4vw,4.6rem)",
                transform: "translate(-50%,-50%)",
              }}
            >
              {y}
            </span>
          ))}
        </div>

        {/* what the count is of, directly under the year being read */}
        <div className="absolute inset-x-0 top-1/2 mt-[clamp(1.6rem,3.4vw,3rem)] text-center">
          <p className="label label-xs text-gold/85">{n} Years of Excellence</p>
        </div>

        {/* the standing claim, lower in the dial */}
        <div
          data-intro-fade
          className="absolute inset-x-0 bottom-[8%] text-center"
        >
          <p className="font-display text-gold leading-none text-[clamp(1.8rem,3.6vw,3.4rem)]">
            {n}
            <span className="label label-xs text-cream/70 ml-2 align-middle">Years</span>
          </p>
          <p className="label label-xs text-cream/45 mt-2">of trust &amp; growth</p>
        </div>
      </div>

      {/* the two ends of the story, held either side of the dial */}
      <Medallion
        side="left"
        year={START_YEAR}
        kicker="Our beginning"
        line="A vision was born"
      />
      <Medallion
        side="right"
        year={END_YEAR}
        kicker="Our future"
        line="A legacy continues"
      />

      {/* the name itself, not a text stand-in for it */}
      <div data-intro-fade className="absolute top-6 left-7 sm:top-8 sm:left-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/images/logo.png")}
          alt="Al Adrak"
          className="w-[150px] sm:w-[min(20vw,300px)] h-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
        />
      </div>

      {/* the founder's own words — his company is what the years are counting */}
      <figure
        data-intro-fade
        className="absolute z-10 px-7 text-center sm:text-left
                   inset-x-0 bottom-[22vh] sm:inset-x-auto sm:bottom-auto
                   sm:right-[4vw] sm:top-1/2 sm:-translate-y-1/2 sm:w-[24vw] sm:max-w-[360px] sm:px-0"
      >
        <span aria-hidden className="hidden sm:block font-display text-gold text-5xl leading-none">
          &rdquo;
        </span>
        <blockquote className="font-serifit italic text-cream/80 text-[clamp(1rem,1.1vw,1.6rem)] leading-snug sm:-mt-3">
          {leadership.founder.quote}
        </blockquote>
        <figcaption className="label label-xs text-sand/65 mt-4 sm:mt-6">
          {leadership.founder.name}
          <span className="hidden sm:inline"> &middot; Founder</span>
        </figcaption>
      </figure>

      {/* the journey bar — the same progress, read as a span of years */}
      <div
        data-intro-fade
        className="absolute inset-x-0 bottom-[6vh] flex flex-col items-center px-6 text-center"
      >
        <p
          className={`label label-xs text-gold mb-4 transition-opacity duration-700 ${
            landed ? "opacity-100" : "opacity-60"
          }`}
        >
          {n} Years Journey
        </p>
        <div className="w-full max-w-[300px] sm:max-w-md">
          <div className="relative h-px w-full bg-cream/12">
            <div ref={bar} className="absolute inset-y-0 left-0 bg-gold" style={{ width: "0%" }} />
            {/* end caps, so the line reads as a measured span */}
            <span className="absolute -top-1 left-0 h-2 w-px bg-gold/70" />
            <span className="absolute -top-1 right-0 h-2 w-px bg-gold/70" />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="label label-xs text-cream/35">{START_YEAR}</span>
            <span ref={nowYear} className="label label-xs text-cream/35">
              {END_YEAR}
            </span>
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

/**
 * One end of the story, on the dial's centre line.
 *
 * Hidden below `lg`: at narrow widths the dial already fills the screen and
 * these would collide with it. They are decoration for the count, not content —
 * both years are stated again on the journey bar underneath, which every
 * viewport gets.
 */
function Medallion({
  side,
  year,
  kicker,
  line,
}: {
  side: "left" | "right";
  year: number;
  kicker: string;
  line: string;
}) {
  const isLeft = side === "left";
  return (
    <div
      data-intro-fade
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center
                  ${isLeft ? "left-[13vw]" : "right-[13vw]"}`}
    >
      <span className="flex items-center justify-center rounded-full border border-gold/45 text-gold font-display w-[clamp(52px,4.4vw,74px)] h-[clamp(52px,4.4vw,74px)] text-[clamp(0.95rem,1.15vw,1.4rem)] tabular-nums">
        {year}
      </span>
      <span className="label label-xs text-cream/55 mt-3">{kicker}</span>
      <span className="font-serifit italic text-cream/40 text-[clamp(0.8rem,0.85vw,1rem)] mt-1">
        {line}
      </span>
    </div>
  );
}
