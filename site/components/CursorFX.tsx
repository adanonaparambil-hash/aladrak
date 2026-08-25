"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motionOK } from "@/lib/intro";

/**
 * The pointer — a spark that leaves a trail of glitter behind it.
 *
 * The pointer itself is a small hot core inside a soft gold bloom. Moving it
 * throws off sparks, more of them the faster it travels; each one drifts, cools
 * from cream through gold, shrinks, twinkles, and vanishes within about a second.
 * Hold still and the trail dies out entirely, leaving just the core — so the
 * effect appears where the attention is and disappears the moment it is not
 * wanted.
 *
 * Drawn on one canvas rather than as DOM nodes, and composited with "lighter" so
 * the sparks accumulate into a glow where they overlap instead of stacking as
 * flat discs. A DOM node per particle would be hundreds of elements and layout
 * work per frame; this is a few hundred arc fills on the GPU-backed canvas.
 *
 * Around all of it, always visible, is the grab circle — drawn at exactly the
 * radius clicks snap within, so it is not decoration but the pointer's true
 * reach: anything inside the circle is clickable. It sits quiet while empty and
 * brightens, thickens and breathes when it has caught something; a click throws
 * a burst. Nothing here runs on touch, and under reduced motion the whole thing
 * is skipped and the native cursor left in place.
 */

/** ceiling on live sparks; the pool is allocated once and reused */
const MAX_SPARKS = 320;
/** seconds a spark lives at most */
const LIFE = 1.05;

/**
 * The pointer's own dimensions, in CSS pixels.
 *
 * These matter more than they look. The native cursor is hidden while this is
 * active, so whatever is drawn here IS the pointer — and the first pass drew a
 * 2.6px core, roughly five pixels across, which is smaller than the arrow it
 * replaced and too small to aim a click with. A native arrow is about 12px of
 * visible mass, so the core is now in that region and the hover state grows
 * rather than shrinks, since that is when precision is actually wanted.
 */
const CORE_R = 4.6;
const CORE_R_HOVER = 6.2;
/**
 * The bloom stays INSIDE the always-visible grab circle below — at hover it
 * reads as the circle filling with light, not as the reach growing. Its old
 * hover radius of 38 spilled well past the 24px circle, which overstated
 * where a click would land.
 */
const BLOOM_R = 16;
const BLOOM_R_HOVER = 23;

/** everything the circle can act on */
const INTERACTIVE = "a, button, [role=button], input, textarea, select, summary, [data-hit]";
/**
 * How far beyond the hotspot the circle can grab, in px.
 *
 * The OS click point is a single pixel, but what the visitor sees is a ~40px
 * circle — and they aim with what they see. Requiring the invisible centre
 * pixel to sit on the button, while the drawn circle already overlaps it, reads
 * as the site ignoring clicks. So any click landing within this radius of an
 * interactive element is forwarded to it, and the hover ring is driven by the
 * same radius, so whatever the ring lights up is exactly what a click will hit.
 * 24 ≈ the bloom's own radius, so the promise and the behaviour are the same
 * circle.
 */
const SNAP_R = 24;

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  /** 0 = cream hot, 1 = deep gold */
  tone: number;
  /** phase for the twinkle */
  ph: number;
};

export default function CursorFX() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef<SVGCircleElement>(null);
  const pctText = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!motionOK()) return;

    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("has-cursor-fx");

    /* ---------- viewport ---------- */
    let vw = 0;
    let vh = 0;
    let dpr = 1;
    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      cv.style.width = vw + "px";
      cv.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ---------- pointer ---------- */
    let tx = vw / 2;
    let ty = vh / 2;
    let px = tx;
    let py = ty;
    let hover = 0;
    let hoverTarget = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    /** every control on the page, refreshed on the same timer as the tilts */
    let clickables: Element[] = [];
    const collectClickables = () => {
      clickables = Array.from(document.querySelectorAll(INTERACTIVE));
    };
    collectClickables();

    /**
     * What the circle is touching — not just what the hotspot pixel is on.
     *
     * Exact geometry, not sampling: the circle overlaps a control exactly when
     * the point-to-rectangle distance is within SNAP_R, so every control's
     * rectangle is measured and the nearest within reach wins. A first draft
     * probed a ring of elementFromPoint samples instead, and its own coverage
     * check showed why that was wrong: a control clipping the circle corner-on
     * slid between the probes about one time in ten — a promise broken exactly
     * often enough to feel like the site dropping clicks.
     *
     * The winner is then confirmed with one hit test at its nearest point, so a
     * control that is covered by something else — a modal's backdrop above all
     * — cannot pull clicks through the thing covering it.
     */
    const findInteractive = (x: number, y: number): Element | null => {
      let best: Element | null = null;
      let bestD = SNAP_R + 0.001;
      for (const el of clickables) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (
          x < r.left - SNAP_R ||
          x > r.right + SNAP_R ||
          y < r.top - SNAP_R ||
          y > r.bottom + SNAP_R
        )
          continue;
        const dx = Math.max(r.left - x, x - r.right, 0);
        const dy = Math.max(r.top - y, y - r.bottom, 0);
        const d = Math.hypot(dx, dy);
        if (d < bestD) {
          bestD = d;
          best = el;
        }
      }
      if (!best) {
        // the cache refreshes every 2s, so a control inside a just-opened
        // modal may not be in it yet — a direct hit still has to register
        return document.elementFromPoint(x, y)?.closest?.(INTERACTIVE) ?? null;
      }
      if (best.matches(":disabled")) return null;
      const r = best.getBoundingClientRect();
      const ix = Math.min(Math.max(x, r.left + 1), r.right - 1);
      const iy = Math.min(Math.max(y, r.top + 1), r.bottom - 1);
      const at = document.elementFromPoint(ix, iy);
      if (!at) return null;
      return at === best || best.contains(at) || at.closest?.(INTERACTIVE) === best
        ? best
        : null;
    };

    /**
     * Forward a click that landed inside the circle but off the element.
     *
     * Capture phase, so the miss is intercepted before any page handler (a
     * modal backdrop especially) treats it as its own; stopPropagation then
     * guarantees exactly one action fires. Synthetic clicks are ignored —
     * the forwarded click() arrives back here with isTrusted false, which is
     * what prevents a loop.
     */
    const onClick = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      if ((e.target as HTMLElement).closest?.(INTERACTIVE)) return;
      // clicks are rare and this must not act on stale geometry
      collectClickables();
      const near = findInteractive(e.clientX, e.clientY);
      if (!near) return;
      e.preventDefault();
      e.stopPropagation();
      if (near.matches("input, textarea, select") && "focus" in near) {
        (near as HTMLElement).focus();
      }
      if (near instanceof HTMLElement) near.click();
      else near.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    };

    /* ---------- the spark pool ---------- */
    const pool: Spark[] = Array.from({ length: MAX_SPARKS }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      born: -99,
      life: 0,
      size: 0,
      tone: 0,
      ph: 0,
    }));
    let head = 0;

    const emit = (x: number, y: number, n: number, t: number, spread: number) => {
      for (let k = 0; k < n; k++) {
        const s = pool[head];
        head = (head + 1) % MAX_SPARKS;
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * spread;
        s.x = x + Math.cos(a) * 3;
        s.y = y + Math.sin(a) * 3;
        s.vx = Math.cos(a) * sp;
        // a slight upward bias, so the trail behaves like embers not dust
        s.vy = Math.sin(a) * sp - 6;
        s.born = t;
        s.life = LIFE * (0.5 + Math.random() * 0.5);
        // in proportion with the core above; too fine and the trail reads as
        // dust rather than as sparks
        s.size = 0.9 + Math.random() * 2.4;
        s.tone = Math.random();
        s.ph = Math.random() * Math.PI * 2;
      }
    };

    const onDown = (e: MouseEvent) => {
      emit(e.clientX, e.clientY, 26, performance.now() / 1000, 190);
    };

    /* ---------- scroll: corner dial only, written imperatively ---------- */
    const C = 2 * Math.PI * 20;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress.current) {
        progress.current.style.strokeDashoffset = String(C * (1 - p));
      }
      // textContent, not React state: setState here re-rendered the component on
      // every scroll event, which is a frame's work thrown away sixty times a
      // second for a number that is two characters wide
      if (pctText.current) pctText.current.textContent = `${Math.round(p * 100)}%`;
      if (wrap.current) {
        const shown = window.scrollY > 400;
        wrap.current.style.opacity = shown ? "1" : "0";
        // while invisible it must not be clickable either — with snapping, an
        // invisible-but-active button would even pull nearby clicks to itself
        wrap.current.style.pointerEvents = shown ? "auto" : "none";
      }
    };
    onScroll();

    /* ---------- tilt targets, cached ---------- */
    let tilts: HTMLElement[] = [];
    const collectTilts = () => {
      tilts = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    };
    collectTilts();
    const tiltTimer = window.setInterval(() => {
      collectTilts();
      // controls come and go too — modals, strips, the news reader
      collectClickables();
    }, 2000);

    /* ---------- one frame ---------- */
    let raf = 0;
    let prev = performance.now() / 1000;
    let frameN = 0;
    const frame = (nowMs: number) => {
      const t = nowMs / 1000;
      const dt = Math.min(0.05, t - prev);
      prev = t;

      // hover by proximity, on the same radius the click snaps to — so the
      // ring lights up on exactly what a click would hit. Every 3rd frame is
      // 20Hz, within a frame or two of a mouseover and far cheaper than probing
      // every frame.
      if (frameN++ % 3 === 0) {
        hoverTarget = findInteractive(tx, ty) ? 1 : 0;
      }

      // the core eases toward the true pointer; the gap is what the sparks fill
      const lx = px;
      const ly = py;
      px += (tx - px) * 0.28;
      py += (ty - py) * 0.28;
      const speed = Math.hypot(px - lx, py - ly);
      hover += (hoverTarget - hover) * 0.15;

      // sparks in proportion to travel, so a still pointer makes none at all
      const n = Math.min(6, Math.floor(speed * 0.5 + hover * 1.2));
      if (n > 0) emit(px, py, n, t, 26 + speed * 5);

      ctx.clearRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = "lighter";

      /* the trail */
      for (const s of pool) {
        const age = t - s.born;
        if (age < 0 || age > s.life) continue;
        const f = age / s.life;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // drag, and a gentle sink once the ember has cooled
        s.vx *= 0.94;
        s.vy = s.vy * 0.94 + 26 * dt;
        // fade out on a curve so the tail thins rather than cutting off
        const fade = (1 - f) * (1 - f);
        const twinkle = 0.55 + 0.45 * Math.sin(t * 14 + s.ph);
        const alpha = fade * twinkle * 0.9;
        if (alpha <= 0.01) continue;
        // cream at birth, gold as it cools
        const r = 246 - s.tone * 45 * f;
        const g = 226 - s.tone * 71 * f;
        const b = 170 - s.tone * 101 * f;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - f * 0.65), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      /* the bloom, then the hot core on top of it */
      const bloomR = BLOOM_R + hover * (BLOOM_R_HOVER - BLOOM_R);
      const bloom = ctx.createRadialGradient(px, py, 0, px, py, bloomR);
      bloom.addColorStop(0, `rgba(246,226,170,${0.5 + hover * 0.2})`);
      bloom.addColorStop(0.45, `rgba(201,155,69,${0.18 + hover * 0.12})`);
      bloom.addColorStop(1, "rgba(201,155,69,0)");
      ctx.beginPath();
      ctx.arc(px, py, bloomR, 0, Math.PI * 2);
      ctx.fillStyle = bloom;
      ctx.fill();

      // the core, with a thin dark rim so it stays findable on a pale section —
      // a cream dot alone disappears against the parchment backgrounds
      const coreR = CORE_R + hover * (CORE_R_HOVER - CORE_R);
      ctx.beginPath();
      ctx.arc(px, py, coreR + 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16,24,19,0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, coreR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,247,230,0.97)";
      ctx.fill();

      /**
       * The grab circle — always drawn, at exactly SNAP_R, because it IS the
       * click area: anything inside this circle can be clicked. Showing it only
       * on hover (the previous behaviour) meant the visitor could not see the
       * reach until something was already caught, so the pointer read as
       * "centre dot only" — which is precisely the complaint. Quiet when empty;
       * when it catches something it brightens, thickens, and breathes.
       */
      {
        const glow = 0.3 + hover * 0.6;
        const pulse = hover > 0.01 ? 0.88 + 0.12 * Math.sin(t * 5.2) : 1;
        ctx.save();
        if (hover > 0.01) {
          ctx.shadowColor = "rgba(226,186,108,0.8)";
          ctx.shadowBlur = 10 * hover;
        }
        ctx.beginPath();
        ctx.arc(px, py, SNAP_R, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(226,186,108,${(glow * pulse).toFixed(3)})`;
        ctx.lineWidth = 1.1 + hover * 0.8;
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";

      /**
       * Tilt, through gsap.set rather than a direct style write: the hero's
       * content block is both a tilt target and the subject of a scrubbed
       * gsap.to({ y: -120 }), and the two must share one transform.
       */
      for (const el of tilts) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        gsap.set(el, {
          rotationY: ((tx - (r.left + r.width / 2)) / r.width) * 6,
          rotationX: -((ty - (r.top + r.height / 2)) / r.height) * 6,
          transformPerspective: 900,
        });
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(tiltTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      for (const el of tilts) {
        gsap.set(el, { clearProps: "rotationX,rotationY,transformPerspective" });
      }
      document.documentElement.classList.remove("has-cursor-fx");
    };
  }, []);

  return (
    <>
      {/* the pointer and its trail */}
      <canvas
        ref={canvas}
        aria-hidden
        className="hidden md:block fixed inset-0 pointer-events-none z-[200]"
      />

      {/* corner dial — scroll position, and a way back to the top */}
      <button
        ref={wrap}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-ink/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-opacity duration-500 opacity-0 hover:border-gold"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90 absolute">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle
            ref={progress}
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20}
          />
        </svg>
        <span ref={pctText} className="label label-xs text-cream/90">
          0%
        </span>
      </button>
    </>
  );
}
