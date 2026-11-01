"use client";

import { useEffect, useState } from "react";
import { useText } from "@/lib/translate-client";

/**
 * Visitors since the counter was switched on.
 *
 * Two things were wrong with what this replaced, and they are worth writing
 * down because they are easy to reintroduce.
 *
 * It counted page loads, not people. The old counter was a hosted badge image,
 * and an image counts once every time it is fetched — so one person reading
 * four pages was four, and opening the site twice in a morning added two more.
 * The figure only ever went up faster than the truth. A browser is counted once
 * here: the first visit POSTs, and every visit after that only reads. Whether
 * this browser has been here before is remembered in localStorage, because the
 * browser is the only party that knows it — the server cannot tell two visits
 * apart without identifying people, which is not worth doing for a number in a
 * footer.
 *
 * And it was a picture. The badge arrived as a flat PNG-ish SVG from another
 * domain, in another typeface, at whatever size it felt like, and it looked
 * pasted on — because it was. The number is now the site's own markup in the
 * site's own faces, so it can be set, spaced and animated like everything else.
 *
 * If the endpoint is not configured (GitHub Pages, which serves files and never
 * executes them) or cannot be reached, this renders nothing at all. An
 * invented or stale number would be worse than no number.
 */

/** Set by the PHP-host build; unset on GitHub Pages, where PHP does not run. */
const ENDPOINT = process.env.NEXT_PUBLIC_VISITS_ENDPOINT ?? "";

/** Remembers that this browser has been counted. */
const SEEN = "aladrak-visitor";

export default function VisitorCounter() {
  const textForLocale = useText();
  const [count, setCount] = useState<number | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!ENDPOINT) return;

    /* A browser that has been here before only reads. If localStorage is
       unavailable — private windows, blocked site data — the visit is treated
       as a repeat rather than a new one: undercounting is the safer error,
       since the alternative inflates the figure on every page load. */
    let first = false;
    try {
      first = !localStorage.getItem(SEEN);
    } catch {
      first = false;
    }

    const ctrl = new AbortController();
    fetch(ENDPOINT, { method: first ? "POST" : "GET", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { ok?: boolean; count?: number }) => {
        if (!j.ok || typeof j.count !== "number") return;
        if (first) {
          try {
            localStorage.setItem(SEEN, "1");
          } catch {
            /* nothing to do: next visit counts again, which is the old behaviour */
          }
        }
        setCount(j.count);
      })
      .catch(() => {
        /* stays hidden */
      });

    return () => ctrl.abort();
  }, []);

  /* The number counts up once, the way the safety figures on the HSE page do.
     Under reduced motion it simply appears — the same information, no movement. */
  useEffect(() => {
    if (count === null) return;

    /* Reduced motion runs the same loop over no time at all, so the first
       frame lands on the final figure. Writing the value straight into state
       here instead would be a synchronous setState inside an effect — a
       cascading render, and something the lint rule rightly objects to. */
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1600;

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
      setShown(Math.round(count * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  if (count === null) return null;

  const label = textForLocale(count === 1 ? "visitor" : "visitors");
  /* Western digits in both languages: that is what Gulf business writing uses,
     and what the rest of this site's figures are set in. */
  const final = count.toLocaleString("en-US");

  return (
    <div
      className="inline-flex items-baseline gap-2"
      /* the animated digits are decoration; a screen reader is told the real
         figure once, as a sentence, instead of hearing it tick */
      aria-label={`${final} ${textForLocale("site visitors")}`}
    >
      <span
        aria-hidden="true"
        dir="ltr"
        className="font-display text-xl leading-none text-gold tabular-nums"
      >
        {shown.toLocaleString("en-US")}
      </span>
      <span aria-hidden="true" className="label label-xs text-cream/55">
        {label}
      </span>
    </div>
  );
}
