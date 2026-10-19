"use client";

import { useEffect, useState } from "react";

/**
 * A read-only diagnostic overlay, shown ONLY when the address ends in ?diag=1.
 *
 * It exists because the scroll-pin faults being reported happen on other
 * people's machines and have not reproduced on ours — resizing mid-pin,
 * reloading at depth and a full scroll sweep of the section boundaries all came
 * back clean. Rather than keep changing code on a guess, this prints the few
 * numbers that would actually identify the cause, so one screenshot from the
 * machine that shows the fault settles it.
 *
 * It renders nothing at all without the flag: no listeners, no timers, no cost
 * to an ordinary visit. Delete it once the fault is understood.
 */
export default function Diag() {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("diag")) return;
    setOn(true);

    const read = () => {
      const rows: string[] = [];
      document.querySelectorAll(".pin-spacer").forEach((sp) => {
        const el = sp.firstElementChild as HTMLElement | null;
        if (!el) return;
        const id =
          el.closest("section[id]")?.id ||
          (el.className || "").toString().split(" ")[0] ||
          "?";
        const spBox = sp.getBoundingClientRect();
        const top = Math.round(spBox.top + window.scrollY);
        const end = Math.round(top + (spBox.height - el.getBoundingClientRect().height));
        rows.push(
          `${id.padEnd(10)} ${String(top).padStart(6)}-${String(end).padEnd(6)} ${getComputedStyle(el).position}`
        );
      });

      // the fault being hunted: more than one pinned stage fixed at the same time
      const fixed = [...document.querySelectorAll<HTMLElement>(".pin-spacer")]
        .map((sp) => sp.firstElementChild as HTMLElement | null)
        .filter((el): el is HTMLElement => !!el && getComputedStyle(el).position === "fixed")
        .map((el) => el.closest("section[id]")?.id || "?");

      // Chrome reports zoom as a ratio of outer to inner width; not exact on
      // every platform but enough to tell 100% from 125%
      const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);

      setText(
        [
          `viewport  ${window.innerWidth} x ${window.innerHeight}`,
          `dpr       ${window.devicePixelRatio}  (zoom ~${zoom}%)`,
          `reduced   ${window.matchMedia("(prefers-reduced-motion: reduce)").matches}`,
          `scrollY   ${Math.round(window.scrollY)}`,
          `doc       ${document.body.scrollHeight}`,
          `pins      ${rows.length}`,
          ...rows,
          `FIXED NOW ${fixed.length ? fixed.join(" + ") : "none"}`,
          fixed.length > 1 ? ">>> OVERLAP <<<" : "",
          `ua        ${navigator.userAgent.slice(0, 64)}`,
        ]
          .filter(Boolean)
          .join("\n")
      );
    };

    read();
    const t = window.setInterval(read, 400);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.clearInterval(t);
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
        background: "rgba(0,0,0,0.86)",
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
