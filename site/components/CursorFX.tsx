"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { motionOK } from "@/lib/intro";

/**
 * The pointer.
 *
 * A gold core with a ring chasing it, which is a common enough device — what
 * makes this one the site's own is that it carries the scroll. While the page is
 * moving, the ring becomes a progress dial: an arc draws round it showing how far
 * through the site you are, a chevron leans in the direction of travel, and the
 * whole thing stretches along the axis of movement. Stop, and it settles back to
 * a plain ring within a second. So the cursor answers "where am I" exactly when
 * that question comes up, and stays out of the way otherwise.
 *
 * Three things it does that the previous version did not:
 *   - squash and stretch along the direction of motion, which is what makes a
 *     trailing ring feel like it has weight rather than lag;
 *   - report scroll progress and direction, so scrolling has a response at the
 *     point of attention instead of only in the corner of the screen;
 *   - name the action it is over — a link reads "View", the brochure "Open" —
 *     rather than just growing.
 *
 * It also fixes a real cost. The old version ran querySelectorAll for the tilt
 * targets and created a fresh GSAP tween for every one of them on every single
 * mousemove event — hundreds of tweens a second while the mouse moved. The
 * pointer's own position is now integrated in one rAF loop and written straight
 * to transforms; the tilt list is cached and driven by gsap.set, which allocates
 * nothing and still shares the element's transform with the hero's own tween.
 *
 * Nothing here runs on a touch device, and under reduced motion the pointer is
 * left entirely alone — the native cursor is the accessible default.
 */

/** how long after the last scroll the ring stays in progress mode */
const SCROLL_HOLD = 900;

export default function CursorFX() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const chev = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const progress = useRef<SVGCircleElement>(null);
  const wrap = useRef<HTMLButtonElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // no pointer FX on touch, and none at all when motion is to be reduced
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!motionOK()) return;

    document.documentElement.classList.add("has-cursor-fx");

    /* ---------- pointer state, integrated once per frame ---------- */
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let dx = tx;
    let dy = ty;
    let rx = tx;
    let ry = ty;
    /** ring scale target: 1 idle, larger over something interactive */
    let hover = 0;
    /** 0..1 how much of the scroll dial is showing */
    let scrolling = 0;
    let lastScroll = -9999;
    /** +1 down, -1 up */
    let dir = 1;
    let scrollP = 0;

    const RING_R = 21;
    const ARC_C = 2 * Math.PI * RING_R;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    /* ---------- what is under the pointer ---------- */
    const HINTS: Array<[string, string]> = [
      ['a[href$=".pdf"]', "Open"],
      ["a[href^=mailto]", "Write"],
      ["a[href^=tel]", "Call"],
      ["[data-cursor-label]", ""],
      ["a, button, [role=button]", "View"],
    ];
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      let text = "";
      let found: Element | null = null;
      for (const [sel, word] of HINTS) {
        const hit = t.closest(sel);
        if (hit) {
          found = hit;
          text = (hit as HTMLElement).dataset.cursorLabel || word;
          break;
        }
      }
      hover = found ? 1 : 0;
      if (label.current) label.current.textContent = text;
    };

    /* ---------- scroll: progress, direction, and the dial's dwell ---------- */
    let lastY = window.scrollY;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollP = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      const delta = window.scrollY - lastY;
      if (Math.abs(delta) > 0.5) dir = delta > 0 ? 1 : -1;
      lastY = window.scrollY;
      lastScroll = performance.now();

      // the corner dial keeps its own job: jump back to the top
      if (progress.current) {
        progress.current.style.strokeDashoffset = String(
          2 * Math.PI * 20 * (1 - scrollP)
        );
      }
      setPct(Math.round(scrollP * 100));
      if (wrap.current) wrap.current.style.opacity = window.scrollY > 400 ? "1" : "0";
    };
    onScroll();

    /* ---------- tilt targets, cached rather than re-queried per event ---------- */
    let tilts: HTMLElement[] = [];
    const collectTilts = () => {
      tilts = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    };
    collectTilts();
    // sections mount and unmount as the page is used; refresh occasionally
    // rather than on every mouse movement
    const tiltTimer = window.setInterval(collectTilts, 2000);

    /* ---------- one frame ---------- */
    let raf = 0;
    let prevX = tx;
    let prevY = ty;
    const frame = (now: number) => {
      // the core is quick, the ring lags — that gap is the whole effect
      dx += (tx - dx) * 0.35;
      dy += (ty - dy) * 0.35;
      rx += (tx - rx) * 0.14;
      ry += (ty - ry) * 0.14;

      // velocity of the RING, not the mouse: it is the thing being deformed
      const vx = rx - prevX;
      const vy = ry - prevY;
      prevX = rx;
      prevY = ry;
      const speed = Math.hypot(vx, vy);
      const angle = speed > 0.4 ? (Math.atan2(vy, vx) * 180) / Math.PI : 0;
      // squash and stretch, capped so fast flicks stay a ring and not a line
      const stretch = Math.min(0.55, speed * 0.02);

      scrolling += ((now - lastScroll < SCROLL_HOLD ? 1 : 0) - scrolling) * 0.12;

      if (dot.current) {
        dot.current.style.transform =
          `translate3d(${dx}px,${dy}px,0) translate(-50%,-50%) scale(${1 - hover * 0.55})`;
      }
      if (ring.current) {
        const s = 1 + hover * 0.85 + scrolling * 0.25;
        ring.current.style.transform =
          `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) rotate(${angle}deg)` +
          ` scale(${(s * (1 + stretch)).toFixed(3)},${(s * (1 - stretch * 0.7)).toFixed(3)})`;
        ring.current.style.borderColor = `rgba(201,155,69,${(0.5 + hover * 0.45).toFixed(2)})`;
        ring.current.style.backgroundColor = `rgba(201,155,69,${(hover * 0.1).toFixed(3)})`;
      }
      if (arc.current) {
        arc.current.style.strokeDashoffset = String(ARC_C * (1 - scrollP));
        arc.current.style.opacity = (scrolling * 0.95).toFixed(3);
      }
      if (chev.current) {
        chev.current.style.opacity = (scrolling * (1 - hover)).toFixed(3);
        chev.current.style.transform =
          `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) rotate(${dir > 0 ? 0 : 180}deg)`;
      }
      if (label.current) {
        label.current.style.transform = `translate3d(${rx}px,${ry + 34}px,0) translate(-50%,0)`;
        label.current.style.opacity = hover ? "0.95" : "0";
      }

      /**
       * Tilt, from the cached list.
       *
       * Through gsap.set, NOT by writing style.transform. The hero's content
       * block is both the tilt target and the subject of a scrubbed
       * gsap.to(..., { y: -120 }) as the curtain rises, and the two have to share
       * one transform. Writing the property directly would overwrite that drift
       * every frame and kill it; gsap.set composes with it, because GSAP keeps a
       * single combined transform per element.
       *
       * gsap.set is also the cheap half of the old bug: the previous version
       * called gsap.to per element on every mousemove, allocating a tween each
       * time. This allocates none.
       */
      if (tilts.length) {
        const vh = window.innerHeight;
        for (const el of tilts) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          const ox = (tx - (r.left + r.width / 2)) / r.width;
          const oy = (ty - (r.top + r.height / 2)) / r.height;
          gsap.set(el, {
            rotationY: ox * 6,
            rotationX: -oy * 6,
            transformPerspective: 900,
          });
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(tiltTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("scroll", onScroll);
      // clear only what the tilt owns; the hero's own scrubbed y must survive
      for (const el of tilts) {
        gsap.set(el, { clearProps: "rotationX,rotationY,transformPerspective" });
      }
      document.documentElement.classList.remove("has-cursor-fx");
    };
  }, []);

  return (
    <>
      {/* the core */}
      <div
        ref={dot}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 w-[7px] h-[7px] rounded-full bg-gold pointer-events-none z-[200] will-change-transform"
      />

      {/* the ring, and the scroll dial drawn on it */}
      <div
        ref={ring}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 w-[42px] h-[42px] rounded-full border border-gold/50 pointer-events-none z-[200] will-change-transform"
      >
        <svg viewBox="0 0 42 42" className="absolute -inset-px w-[44px] h-[44px] -rotate-90">
          <circle
            ref={arc}
            cx="22"
            cy="22"
            r="21"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 21}
            strokeDashoffset={2 * Math.PI * 21}
            style={{ opacity: 0 }}
          />
        </svg>
      </div>

      {/* direction of travel, shown only while the page is moving */}
      <div
        ref={chev}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 pointer-events-none z-[201] text-gold will-change-transform"
        style={{ opacity: 0 }}
      >
        <svg width="9" height="6" viewBox="0 0 9 6">
          <path d="M0.5 0.5 L4.5 4.5 L8.5 0.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* what the thing under the pointer will do */}
      <div
        ref={label}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 pointer-events-none z-[201] label label-xs text-gold whitespace-nowrap will-change-transform"
        style={{ opacity: 0 }}
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
        <span className="label label-xs text-cream/90">{pct}%</span>
      </button>
    </>
  );
}
