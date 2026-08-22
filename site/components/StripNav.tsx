"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Arrow controls for a horizontally scrolling strip.
 *
 * The strips on this site carry `no-scrollbar`, which means that on a desktop
 * pointer there is no affordance AND no obvious way to reach the items past the
 * right edge: the scrollbar is hidden, a vertical wheel scrolls the page rather
 * than the strip, and Lenis owns the page scroll. Touch devices can swipe, so
 * this went unnoticed. These buttons drive the strip programmatically instead.
 *
 * Renders nothing when the content fits — no dead controls on a wide screen.
 */
export default function StripNav({
  target,
  label,
  className = "",
}: {
  target: RefObject<HTMLDivElement | null>;
  /** what the strip contains, for the button's accessible name */
  label: string;
  className?: string;
}) {
  const [prev, setPrev] = useState(false);
  const [next, setNext] = useState(false);

  const measure = useCallback(() => {
    const el = target.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // 8px of slack so a sub-pixel resting position does not leave a live button
    setPrev(el.scrollLeft > 8);
    setNext(el.scrollLeft < max - 8);
  }, [target]);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    // images and videos landing late change scrollWidth
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [target, measure]);

  const step = (dir: 1 | -1) => {
    const el = target.current;
    if (!el) return;
    // advance by one card plus the gap, so the snap points stay aligned
    const card = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "20") || 20;
    const by = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: "smooth" });
  };

  if (!prev && !next) return null;

  const btn =
    "w-11 h-11 rounded-full border flex items-center justify-center transition-colors duration-300 " +
    "disabled:opacity-30 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        onClick={() => step(-1)}
        disabled={!prev}
        aria-label={`Previous ${label}`}
        className={`${btn} border-current/25 text-current hover:not-disabled:bg-current/10 focus-visible:outline-current`}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
          <path
            d="M9.5 2.5 L4.5 7.5 L9.5 12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={() => step(1)}
        disabled={!next}
        aria-label={`Next ${label}`}
        className={`${btn} border-current/25 text-current hover:not-disabled:bg-current/10 focus-visible:outline-current`}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
          <path
            d="M5.5 2.5 L10.5 7.5 L5.5 12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
