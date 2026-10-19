"use client";

import { useEffect } from "react";
import { motionOK } from "@/lib/intro";

/**
 * The finishing touches — interaction effects layered over the page, none of which change anything that
 * was already there.
 *
 *   tap ripple      a ring and a scatter of sparks where a finger lands on something tappable. The page
 *                   already has a glitter cursor with a click burst, but that is mouse-only; on a phone
 *                   or tablet a tap gave no feedback at all. Mice are skipped here so a click is not
 *                   answered twice.
 *   magnetic        the gold call-to-action pills lean a few pixels toward the pointer while it is over
 *                   them. Fine pointers only.
 *   card spotlight  a soft gold light follows the pointer across the facility and news cards. Fine
 *                   pointers only. This file only reports where the pointer is (--sx / --sy); the light
 *                   itself, and everything else visual, is CSS in globals.css.
 *
 * Everything is skipped under reduced motion. One delegated listener per kind, passive, and the pointer-
 * move work is throttled to one pass per frame, so it costs nothing on a page that is not being pointed at.
 * It is all additive: nothing is wrapped or moved, so a failure here leaves the site exactly as it was.
 */

/** what a tap can mean something on */
const TAPPABLE = "a, button, [role=button], summary, [data-hit]";
/** the pills that lean toward the pointer */
const MAGNETIC = "a.rounded-full, button.rounded-full";
/** cards that carry the spotlight */
const SPOT = "[data-fcard], [data-ncard]";

/** a finger that has moved further than this, or held longer than that, was a scroll or a press-and-hold */
const TAP_SLOP = 12;
const TAP_MS = 600;
/** at most this many ripples alive at once, so a drummed-on screen cannot pile up nodes */
const MAX_RIPPLES = 5;

function ripple(x: number, y: number) {
  const live = document.querySelectorAll(".fx-ripple");
  if (live.length >= MAX_RIPPLES) live[0].remove();

  const root = document.createElement("div");
  root.className = "fx-ripple";
  root.style.left = `${x}px`;
  root.style.top = `${y}px`;
  root.setAttribute("aria-hidden", "true");

  const ring = document.createElement("i");
  ring.className = "fx-ring";
  const core = document.createElement("i");
  core.className = "fx-core";
  root.append(core, ring);

  // six sparks thrown outward at slightly uneven angles and distances, so it reads as a spill, not a diagram
  const SPARKS = 6;
  for (let k = 0; k < SPARKS; k++) {
    const a = ((k + Math.random() * 0.6) / SPARKS) * Math.PI * 2;
    const d = 26 + Math.random() * 22;
    const s = document.createElement("i");
    s.className = "fx-spark";
    s.style.setProperty("--dx", `${(Math.cos(a) * d).toFixed(1)}px`);
    s.style.setProperty("--dy", `${(Math.sin(a) * d).toFixed(1)}px`);
    s.style.animationDelay = `${(Math.random() * 0.06).toFixed(3)}s`;
    root.append(s);
  }

  document.body.append(root);
  window.setTimeout(() => root.remove(), 900);
}

export default function PremiumFX() {
  useEffect(() => {
    if (!motionOK()) return;
    const cleanups: Array<() => void> = [];
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- tap ripple: touch and pen, on release, only for a genuine tap ---------- */
    let down: { x: number; y: number; t: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !down || down.id !== e.pointerId) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const held = performance.now() - down.t;
      down = null;
      if (moved > TAP_SLOP || held > TAP_MS) return;
      const target = e.target as Element | null;
      if (!target?.closest?.(TAPPABLE)) return;
      ripple(e.clientX, e.clientY);
    };
    const onCancel = () => {
      down = null;
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onCancel, { passive: true });
    cleanups.push(() => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
    });

    /* ---------- magnetic pills + card spotlight: a mouse, and nothing else ---------- */
    if (fine) {
      let pill: HTMLElement | null = null;
      let last: PointerEvent | null = null;
      let raf = 0;

      /**
       * Let go: clear the lean and ease the element home with a Web Animation. That is deliberate — the pills
       * carry their own CSS transitions (some colour-only, some `transition-all`), and overriding those
       * to smooth this would change how they already behave. An animation on `translate` sits beside them.
       */
      const release = (el: HTMLElement | null, animate = true) => {
        if (!el || !el.style.translate) return;
        const from = el.style.translate;
        el.style.translate = "";
        if (animate && typeof el.animate === "function") {
          el.animate([{ translate: from }, { translate: "0px 0px" }], {
            duration: 380,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          });
        }
      };
      /** a real call-to-action: has a label, is a proper button size, is in the flow, and is not already moved by a utility */
      const eligible = (el: HTMLElement) => {
        if ((el.textContent ?? "").trim().length < 4 || el.offsetWidth < 80) return false;
        const cs = getComputedStyle(el);
        return cs.position !== "fixed" && cs.position !== "absolute" && (cs.translate === "none" || cs.translate === "");
      };

      const frame = () => {
        raf = 0;
        const e = last;
        if (!e) return;
        const t = e.target as Element | null;

        const el = (t?.closest?.(MAGNETIC) as HTMLElement | null) ?? null;
        if (el !== pill) {
          release(pill);
          pill = el && eligible(el) ? el : null;
        }
        if (pill) {
          const r = pill.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const cx = Math.max(-9, Math.min(9, dx * 0.2));
          const cy = Math.max(-6, Math.min(6, dy * 0.3));
          pill.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
        }

        const card = (t?.closest?.(SPOT) as HTMLElement | null) ?? null;
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--sx", `${(e.clientX - r.left).toFixed(0)}px`);
          card.style.setProperty("--sy", `${(e.clientY - r.top).toFixed(0)}px`);
        }
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        last = e;
        if (!raf) raf = requestAnimationFrame(frame);
      };
      const onLeaveWindow = () => {
        release(pill);
        pill = null;
        last = null;
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);
      cleanups.push(() => {
        document.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
        if (raf) cancelAnimationFrame(raf);
        release(pill, false);   // unmounting: nothing left to animate
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
