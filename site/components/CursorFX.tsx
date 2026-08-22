"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Screen-level motion FX:
 *  1. Custom cursor — gold dot + trailing ring that grows over anything clickable.
 *  2. Scroll progress ring (bottom-right) — fills as you scroll, click = back to top.
 *  3. Mouse 3D tilt — elements marked [data-tilt] lean toward the cursor.
 */
export default function CursorFX() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const progress = useRef<SVGCircleElement>(null);
  const wrap = useRef<HTMLButtonElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // skip all pointer FX on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("has-cursor-fx");

    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power2.out" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power2.out" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      // 3D tilt for marked elements near the cursor
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const cx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const cy = (e.clientY - (r.top + r.height / 2)) / r.height;
        gsap.to(el, {
          rotationY: cx * 7,
          rotationX: -cy * 7,
          transformPerspective: 900,
          duration: 0.6,
          ease: "power2.out",
        });
      });
    };

    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(
        "a, button, [role=button], input, textarea, select"
      );
      gsap.to(ring.current, {
        scale: t ? 2.2 : 1,
        opacity: t ? 0.9 : 0.55,
        duration: 0.35,
      });
      gsap.to(dot.current, { scale: t ? 0.4 : 1, duration: 0.35 });
    };

    const leaveTilt = () => {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) =>
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "power3.out" })
      );
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseleave", leaveTilt);

    // scroll progress ring
    const C = 2 * Math.PI * 20;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      if (progress.current)
        progress.current.style.strokeDashoffset = String(C * (1 - p));
      setPct(Math.round(p * 100));
      if (wrap.current)
        wrap.current.style.opacity = scrollY > 400 ? "1" : "0";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.removeEventListener("mouseleave", leaveTilt);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("has-cursor-fx");
    };
  }, []);

  return (
    <>
      {/* cursor dot */}
      <div
        ref={dot}
        className="hidden md:block fixed top-0 left-0 -ml-[4px] -mt-[4px] w-2 h-2 rounded-full bg-gold pointer-events-none z-[200]"
      />
      {/* trailing ring */}
      <div
        ref={ring}
        className="hidden md:block fixed top-0 left-0 -ml-[22px] -mt-[22px] w-11 h-11 rounded-full border border-gold/80 opacity-55 pointer-events-none z-[200] mix-blend-difference"
      />
      {/* scroll progress ring */}
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
            cx="24" cy="24" r="20" fill="none"
            stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20}
          />
        </svg>
        <span className="label label-xs text-cream/90">{pct}%</span>
      </button>
    </>
  );
}
