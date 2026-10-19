"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * A read-only diagnostic overlay, shown ONLY when the address carries ?diag=1.
 *
 * It exists because the scroll-pin faults being reported happen on other
 * people's machines and have not reproduced here. The first pass printed the
 * DOM's own geometry and that was enough to show the real fault — the scroll
 * sitting inside a pin's range with nothing pinned — so this pass asks GSAP
 * directly instead: how many triggers it has, what IT thinks each one's range
 * is, and whether it believes any of them are active.
 *
 * Inert without the flag: no overlay, no listeners, no timers. Delete once the
 * fault is understood.
 */
export default function Diag() {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("diag")) return;
    setOn(true);

    let scrollEvents = 0;
    const countScroll = () => scrollEvents++;
    window.addEventListener("scroll", countScroll, { passive: true });

    const read = () => {
      const all = ScrollTrigger.getAll();
      const pinned = all.filter((t) => t.vars && t.vars.pin);
      const rows = pinned.map((t) => {
        const el = (t.trigger as HTMLElement) || null;
        const id =
          (el && (el.closest("section[id]")?.id || (el.className || "").toString().split(" ")[0])) ||
          "?";
        const pinEl = (t.pin as HTMLElement) || null;
        const pos = pinEl ? getComputedStyle(pinEl).position : "-";
        return `${id.slice(0, 9).padEnd(9)} ${String(Math.round(t.start)).padStart(6)}-${String(
          Math.round(t.end)
        ).padEnd(6)} ${t.isActive ? "ACTIVE" : "  --  "} p=${t.progress.toFixed(2)} ${pos}`;
      });

      const html = document.documentElement;
      setText(
        [
          `viewport  ${window.innerWidth} x ${window.innerHeight}  dpr ${window.devicePixelRatio}`,
          `reduced   ${window.matchMedia("(prefers-reduced-motion: reduce)").matches}`,
          `scrollY   ${Math.round(window.scrollY)}   events ${scrollEvents}`,
          `maxScroll ${Math.round(ScrollTrigger.maxScroll(window))}   doc ${html.scrollHeight}`,
          `triggers  ${all.length}  (pinned ${pinned.length})`,
          `htmlOflow ${getComputedStyle(html).overflow}  isIntro ${html.classList.contains("is-intro")}`,
          ...rows,
          `ACTIVE NOW ${pinned.filter((t) => t.isActive).length}`,
          `ua ${navigator.userAgent.slice(0, 58)}`,
        ].join("\n")
      );
    };

    read();
    const t = window.setInterval(read, 400);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("scroll", countScroll);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  if (!on) return null;
  return (
    <pre
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99999,
        margin: 0,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.88)",
        color: "#9effa6",
        font: "11px/1.45 ui-monospace,Consolas,monospace",
        whiteSpace: "pre",
        pointerEvents: "none",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {text}
    </pre>
  );
}
