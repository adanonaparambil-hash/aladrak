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

/**
 * The sweep always takes at least this long, however fast the film buffers.
 *
 * Nearly double the first pass. Forty years went by in 3.4s, which is about
 * eighty milliseconds a year — too quick to read any of them, so the count
 * registered as a blur rather than as a history.
 */
const MIN_SWEEP = 6500;
/** a second visit in the same session gets the short version */
const SEEN_SWEEP = 2600;
const LAND_HOLD = 1200;
/** hard ceiling; must stay clear of MIN_SWEEP + LAND_HOLD */
const MAX_WAIT = 11000;
const SEEN_KEY = "adrak-intro-seen";
/** the entrance, before the count begins */
const ENTER_MS = 1000;

/**
 * The upward stack. Spacing and size both decay geometrically with age, so the
 * column converges instead of running off the top of the screen: with DECAY
 * 0.86 the whole run of forty years occupies a finite ~7 rows of height, however
 * many years there are to show.
 */
const AGE_CULL = 9;
const DECAY = 0.84;
/** how long a decade ripple takes to travel out and fade, in seconds */
const RIPPLE_LIFE = 1.6;

/**
 * The founder's quote sits at right:4vw with width min(24vw, 360px), so its
 * left edge is derived rather than guessed — an estimated band was what let the
 * medallion land on top of it.
 */
const quoteLeftEdge = (vw: number) => vw * 0.96 - Math.min(vw * 0.24, 360);
/** the medallion box, and the clearance it needs beyond the ring */
const MED_W = 140;
const MED_SPACE = MED_W + 12;
/**
 * The medallions are shown only where they are nearly free.
 *
 * A fixed breakpoint was wrong: switching them on at 1440 took 152px off each
 * side and collapsed the ring from R=276 to R=149 the moment the window crossed
 * that width — a jump you would see as the dial suddenly shrinking. Instead the
 * radius is computed both ways and they appear only if keeping them costs less
 * than this share of the ring, so the worst visible step is that same share.
 */
const MED_WORTH_IT = 0.88;
/** below this the composition is too tight for them at any cost */
const MED_MIN_VW = 1180;

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
/**
 * The count's own curve. An ease-out spends most of its speed at the start, so
 * the first two decades blurred past before anything had settled. Smoothstep
 * eases at both ends instead: the years pull away from 1986 gently, run at an
 * even pace through the middle, and glide to rest on the present.
 */
const smoothstep = (t: number) => t * t * (3 - 2 * t);
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
  const claim = useRef<HTMLSpanElement>(null);
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
    /** how far the medallions reach beyond the ring at this width */
    let medSpace = 0;
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
      const wide = vw >= 1024;
      cx = vw / 2;
      // lifted on a phone, where the quote and the bar share the lower screen
      cy = narrow ? vh * 0.42 : vh * 0.5;

      /**
       * The radius is bounded by what the furniture leaves free, not chosen and
       * hoped for. The founder's quote occupies a band down the right on wide
       * screens and the medallions hang off the dial's sides, so the dial has to
       * fit between them — the previous pass placed the medallions at a fixed
       * 13vw from the viewport edge instead, which put the right one straight on
       * top of the quote at 1900px wide.
       */
      const rightLimit = wide ? quoteLeftEdge(vw) - 16 : vw - 16;
      // the radius the space allows, with the medallions and without them
      const radiusFor = (med: number) =>
        clamp(
          Math.min(
            vh * 0.36,
            // the ring plus its medallion must stop short of the quote
            rightLimit - med - cx,
            // and stay clear of the left edge by the same margin
            cx - med - 16
          ),
          104,
          340
        );
      const bare = radiusFor(0);
      const withMed = radiusFor(MED_SPACE);
      const showMed = vw >= MED_MIN_VW && withMed >= bare * MED_WORTH_IT;
      medSpace = showMed ? MED_SPACE : 0;
      R = showMed ? withMed : bare;
      fontPx = clamp(R * 0.28, 24, 92);
      // the stack converges to gap/(1-DECAY); keep that inside the ring
      gap = fontPx * 0.46;

      if (dial.current) {
        dial.current.style.left = `${cx}px`;
        dial.current.style.top = `${cy}px`;
        dial.current.style.width = `${R * 2}px`;
        dial.current.style.height = `${R * 2}px`;
        // the medallions hang off the dial itself, so they track the ring at
        // every width instead of being placed against the viewport
        dial.current.dataset.med = showMed ? "1" : "0";
      }
      // the year type is sized from the radius, so the column keeps its
      // proportion to the ring rather than to the viewport
      for (const lb of labels.current) {
        if (lb) lb.style.fontSize = `${fontPx}px`;
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

    /** timestamps of decade crossings, for the ripples they throw off */
    const ripples: number[] = [];
    let lastDecade = -1;
    /** when the year on the centre line last changed, for its landing pop */
    let lastYear = -1;
    let popAt = -99;

    /* ---------- one frame ---------- */
    const render = (p: number, tSec: number) => {
      ctx.clearRect(0, 0, vw, vh);
      const narrow = vw < 640;

      // milestones: a ripple each time the count crosses into a new decade,
      // and a pop each time a new year settles on the centre line
      const nowYearInt = START_YEAR + Math.round(p * SPAN);
      const decade = Math.floor(nowYearInt / 10);
      if (lastDecade === -1) lastDecade = decade;
      else if (decade !== lastDecade) {
        lastDecade = decade;
        ripples.push(tSec);
      }
      if (lastYear === -1) lastYear = nowYearInt;
      else if (nowYearInt !== lastYear) {
        lastYear = nowYearInt;
        popAt = tSec;
      }

      /**
       * The entrance: the dial establishes itself before the count starts, so
       * the years begin from a composition that is already there rather than
       * appearing on top of one still assembling.
       */
      const ent = easeOutCubic(clamp01(tSec / (ENTER_MS / 1000)));

      /* the star field, drifting and breathing. The drift is by depth — smaller
         stars are read as further away and move least, which gives the field
         parallax as the tunnel comes toward the viewer. */
      for (const s of stars) {
        const tw = 0.65 + 0.35 * Math.sin(tSec * 0.9 + s.tw);
        const dy = (s.r - 0.5) * 5 * Math.sin(tSec * 0.06 + s.tw * 0.4);
        const dx = (s.r - 0.5) * 7 * Math.cos(tSec * 0.045 + s.tw * 0.3);
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,242,234,${(s.a * tw * ent).toFixed(3)})`;
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

      // the dotted inner ring, turning slowly so the dial is never static
      const innerR = R * 0.9;
      const dots = narrow ? 84 : 150;
      const spinDots = tSec * 0.055;
      ctx.beginPath();
      for (let j = 0; j < dots; j++) {
        const a = (j / dots) * Math.PI * 2 - Math.PI / 2 + spinDots;
        const x = cx + Math.cos(a) * innerR;
        const y = cy + Math.sin(a) * innerR;
        ctx.moveTo(x + 0.9, y);
        ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      }
      ctx.fillStyle = `rgba(216,201,163,${(0.34 * ent).toFixed(3)})`;
      ctx.fill();

      /**
       * A slow beam sweeping the dial, like a survey instrument. It is what
       * stops the ring reading as a still image between year changes — the
       * previous pass had nothing moving on the ring itself for a second at a
       * time.
       */
      {
        const beam = tSec * 0.45;
        const g = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R);
        g.addColorStop(0, "rgba(214,168,80,0)");
        g.addColorStop(1, `rgba(226,186,108,${(0.1 * ent).toFixed(3)})`);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R * 0.98, beam - 0.5, beam);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }

      /**
       * Decade markers. Each decade the company passed gets a tick on the ring,
       * dim until the count reaches it and lit afterwards, so the sweep leaves a
       * visible trail of milestones rather than just a moving number.
       */
      for (let i = 0; i <= SPAN; i++) {
        if ((START_YEAR + i) % 10 !== 0) continue;
        const frac = i / SPAN;
        const a = -Math.PI / 2 + frac * Math.PI * 2;
        const reached = p >= frac;
        const x0 = cx + Math.cos(a) * (R - 9);
        const y0 = cy + Math.sin(a) * (R - 9);
        const x1 = cx + Math.cos(a) * (R + 9);
        const y1 = cy + Math.sin(a) * (R + 9);
        ctx.save();
        if (reached) {
          ctx.shadowColor = "rgba(226,186,108,0.9)";
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = reached
          ? `rgba(246,220,155,${(0.85 * ent).toFixed(3)})`
          : `rgba(216,201,163,${(0.22 * ent).toFixed(3)})`;
        ctx.lineWidth = reached ? 1.8 : 1;
        ctx.stroke();
        ctx.restore();
      }

      /* ripples thrown off as each decade is crossed */
      for (let k = ripples.length - 1; k >= 0; k--) {
        const age = tSec - ripples[k];
        if (age > RIPPLE_LIFE) {
          ripples.splice(k, 1);
          continue;
        }
        const f = age / RIPPLE_LIFE;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.55 + 0.62 * f), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(226,186,108,${(0.3 * (1 - f)).toFixed(3)})`;
        ctx.lineWidth = 1.4 * (1 - f) + 0.3;
        ctx.stroke();
      }

      /**
       * The two crescents that give the dial its light.
       *
       * Drawn as a gradient stroke in three passes — a wide soft bloom, a
       * mid body, then a hot core — because a single stroke with shadowBlur
       * reads as a uniformly thin gold circle, which is exactly how the previous
       * pass came out. They also drift a little either side of the horizontal,
       * so the light looks alive rather than painted on.
       */
      const heat = 0.34 + 0.66 * p;
      const breathe = 0.82 + 0.18 * Math.sin(tSec * 1.05);
      const sway = Math.sin(tSec * 0.35) * 0.16;
      const passes: Array<[number, number, number]> = [
        // [lineWidth, alpha, blur]
        [13, 0.1, 34],
        [5, 0.3, 20],
        [1.8, 0.95, 10],
      ];
      ctx.save();
      ctx.lineCap = "round";
      for (const [lw, alpha, blur] of passes) {
        ctx.shadowColor = "rgba(214,168,80,0.9)";
        ctx.shadowBlur = blur;
        ctx.lineWidth = lw;
        for (const mid of [sway, Math.PI - sway]) {
          const g = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
          g.addColorStop(0, "rgba(228,190,110,0)");
          g.addColorStop(0.5, `rgba(246,220,155,${(alpha * heat * breathe).toFixed(3)})`);
          g.addColorStop(1, "rgba(228,190,110,0)");
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, R, mid - 0.66, mid + 0.66);
          ctx.stroke();
        }
      }
      ctx.restore();

      /* the progress arc, and a travelling head that marks where the count is */
      if (p > 0.001) {
        const head = -Math.PI / 2 + p * Math.PI * 2;
        ctx.save();
        ctx.shadowColor = "rgba(201,155,69,0.6)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, R, -Math.PI / 2, head);
        ctx.strokeStyle = "rgba(228,190,110,0.5)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        // the head itself
        ctx.beginPath();
        ctx.arc(cx + Math.cos(head) * R, cy + Math.sin(head) * R, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250,236,198,0.95)";
        ctx.shadowBlur = 18;
        ctx.fill();
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
        // a hard drop after the centre line, so the year being counted reads as
        // the subject and the ones above it as its history — a gentle falloff
        // made the column look like a list of equals
        let scale = 0.3 + 0.7 * Math.exp(-1.5 * a);
        // the year on the line lands with a small pop, so each one is felt
        // arriving instead of the column merely sliding
        if (a < 0.5) scale *= 1 + 0.09 * Math.exp(-(tSec - popAt) * 9);
        // arrive from just below the line rather than blinking into place
        const arriving = age < 0 ? 1 + age * 2 : 1;
        const lift = age < 0 ? -age * gap * 1.6 : 0;
        lb.style.transform =
          `translate(-50%,-50%) translateY(${(-rise + lift).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        lb.style.opacity = `${(Math.exp(-0.42 * a) * clamp01(arriving)).toFixed(3)}`;
        lb.style.color = a < 0.5 ? "#f5f2ea" : "#d8c9a3";
      }

      if (bar.current) bar.current.style.width = `${(p * 100).toFixed(2)}%`;
      // the claim counts up with the years rather than stating the total from
      // the first frame — the number arrives at the same moment the dial does
      if (claim.current) claim.current.textContent = String(Math.round(pos));
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
      // the entrance plays first; the count starts once the dial is established
      const ramp = smoothstep(clamp01((elapsed - ENTER_MS) / sweepMs));
      // hold just short of the present until the film can actually play
      const next = Math.min(ramp, filmReady ? 1 : 0.88);
      if (next > target) target = next;
      shown += (target - shown) * 0.1;
      if (target - shown < 0.0015) shown = target;
      render(shown, elapsed / 1000);

      if (!landedFlag && shown >= 1 && elapsed >= sweepMs + ENTER_MS) {
        landedFlag = true;
        setLanded(true);
        timers.push(window.setTimeout(() => exit(), LAND_HOLD));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    /**
     * The entrance for everything that is not canvas.
     *
     * Previously the logo, quote, medallions and journey bar were simply there
     * on the first frame while the dial drew itself in behind them, which made
     * the composition look assembled rather than arriving. They now come in
     * around the dial: the name first, then the ends of the story from the sides
     * they belong to, then the bar, then the quote last.
     */
    // scoped to the overlay, so these selectors cannot reach the page beneath
    const enterCtx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-enter-logo]", { autoAlpha: 0, y: -18, duration: 0.8 }, 0.05)
        .from("[data-enter-med-left]", { autoAlpha: 0, x: -34, duration: 0.9 }, 0.35)
        .from("[data-enter-med-right]", { autoAlpha: 0, x: 34, duration: 0.9 }, 0.35)
        .from("[data-enter-claim]", { autoAlpha: 0, y: 16, duration: 0.8 }, 0.5)
        .from("[data-enter-bar]", { autoAlpha: 0, y: 18, duration: 0.8 }, 0.6)
        .from("[data-enter-quote]", { autoAlpha: 0, x: 26, duration: 1 }, 0.75)
        .from("[data-enter-skip]", { autoAlpha: 0, duration: 0.6 }, 1);
    }, el);

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
      enterCtx.revert();
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
        className="intro-dial absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        data-med="0"
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
          data-enter-claim
          className="absolute inset-x-0 bottom-[8%] text-center"
        >
          <p className="font-display text-gold leading-none text-[clamp(1.8rem,3.6vw,3.4rem)]">
            <span ref={claim} className="tabular-nums">
              {n}
            </span>
            <span className="label label-xs text-cream/70 ml-2 align-middle">Years</span>
          </p>
          <p className="label label-xs text-cream/45 mt-2">of trust &amp; growth</p>
        </div>

        {/* The two ends of the story, hung off the ring itself. Being children
            of the dial is the point: they track the radius at every width, so
            they cannot drift into the founder's quote the way viewport-anchored
            placement did. */}
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
      </div>

      {/* the name itself, not a text stand-in for it */}
      <div data-intro-fade data-enter-logo className="absolute top-6 left-7 sm:top-8 sm:left-10">
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
        data-enter-quote
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
        data-enter-bar
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
            <span className="label label-xs text-cream/35">{END_YEAR}</span>
          </div>
        </div>
      </div>

      <button
        data-intro-fade
        data-enter-skip
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
      {...(isLeft ? { "data-enter-med-left": "" } : { "data-enter-med-right": "" })}
      className={`intro-med pointer-events-none absolute top-1/2 -translate-y-1/2 flex-col items-center w-[140px]
                  ${isLeft ? "left-0 -translate-x-full" : "right-0 translate-x-full"}`}
    >
      {/* the connector, reaching from the medallion to the ring's edge */}
      <span
        aria-hidden
        className={`absolute top-1/2 w-7 h-px bg-gradient-to-r from-transparent to-gold/60
                    ${isLeft ? "right-2 rotate-180" : "left-2"}`}
      />
      <span className="flex items-center justify-center rounded-full border border-gold/45 text-gold font-display w-[clamp(52px,4.2vw,72px)] h-[clamp(52px,4.2vw,72px)] text-[clamp(0.95rem,1.1vw,1.35rem)] tabular-nums">
        {year}
      </span>
      <span className="label label-xs text-cream/55 mt-3 whitespace-nowrap">{kicker}</span>
      <span className="font-serifit italic text-cream/40 text-[clamp(0.8rem,0.85vw,1rem)] mt-1 whitespace-nowrap">
        {line}
      </span>
    </div>
  );
}
