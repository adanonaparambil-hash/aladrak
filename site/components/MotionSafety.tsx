"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The net under the animation, for when the app boots but the motion does not.
 *
 * layout.tsx already covers total failure: if SmoothScroll never announces
 * itself within nine seconds the root gets `.js-failed` and globals.css lifts
 * every hidden block. That net only catches a page where nothing ran at all,
 * and the fault actually reported was the opposite — the app booted, announced
 * itself, and then the scroll animation quietly did not drive. Every <Reveal>
 * ships `visibility: hidden` in its markup and waits for a ScrollTrigger to
 * clear it, and every pinned section reserves its scroll room through a spacer
 * that ScrollTrigger pads. So when the triggers do not run, the page keeps its
 * full 44,000px of height, shows nothing in it, and cannot be scrolled out of.
 * `__adrakBooted` was true the whole time.
 *
 * This watches for both of those states and repairs them. It is deliberately
 * quiet: it only acts on a block that SHOULD be visible by now and is not, and
 * on a pin that reserves no room while claiming a duration. On a page where the
 * animation is working it finds nothing and does nothing, so the full
 * experience is untouched.
 */

/** A reveal is overdue once its top has passed this far up the viewport. */
const REVEAL_LINE = 0.95;
/** How long to let the real animation do its job before stepping in. */
const GRACE_MS = 2600;

export default function MotionSafety() {
  useEffect(() => {
    let stopped = false;

    /* ---- blocks that should have been revealed and were not ---------- */
    const sweepReveals = () => {
      const vh = window.innerHeight;
      let fixed = 0;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        // only the ones whose moment has passed; anything still below the fold
        // is simply waiting its turn and must be left alone
        if (el.getBoundingClientRect().top > vh * REVEAL_LINE) return;
        const cs = getComputedStyle(el);
        if (cs.visibility !== "hidden" && cs.opacity !== "0") return;
        el.style.visibility = "visible";
        el.style.opacity = "1";
        fixed++;
      });
      return fixed;
    };

    /**
     * A pin is broken in one of two ways, and the fault shows up as either
     * depending on the viewport and how the load happened to race:
     *
     *   NO ROOM — the spacer reserves nothing (padding 0) while the trigger
     *     claims a duration, so the section holds no scroll space at all.
     *
     *   WRONG PLACE — the spacer reserves the right amount, but the trigger
     *     thinks the section begins somewhere it does not. Measured on the live
     *     site: Expertise's start came out 4,224px above where the element
     *     actually sits, which is exactly the length of History's pin — it was
     *     measured while History's spacer was not in the document. The section
     *     then pins while History is still pinned and the two paint over each
     *     other, which is the overlap that was reported first.
     *
     * The second one is why the earlier version of this file missed the fault
     * on a 1920px screen: it only checked the reserved room, and the room was
     * correct. Comparing the trigger's own start against where the element
     * really is catches both.
     */
    const brokenPins = () =>
      ScrollTrigger.getAll().filter((t) => {
        if (!t.vars || !t.vars.pin) return false;
        const duration = t.end - t.start;
        if (duration < 50) return false; // nothing meaningful claimed
        const pinEl = t.pin as HTMLElement | undefined;
        const spacer =
          pinEl && pinEl.parentElement && pinEl.parentElement.classList.contains("pin-spacer")
            ? pinEl.parentElement
            : null;
        if (!spacer) return false;

        const reserved = parseFloat(getComputedStyle(spacer).paddingBottom) || 0;
        if (reserved < duration * 0.5) return true; // NO ROOM

        // WRONG PLACE. Only trustworthy while this pin is not currently applied:
        // a pinned element is position:fixed, so its rect is viewport-relative
        // and adding scrollY to it would be meaningless.
        if (t.isActive) return false;
        const domTop = spacer.getBoundingClientRect().top + window.scrollY;
        return Math.abs(t.start - domTop) > 40;
      });

    const repairPins = () => {
      let broken = brokenPins();
      if (!broken.length) return;
      // first ask for an honest re-measure; late images and fonts are the usual
      // reason a pin was sized against a page that had not finished growing
      ScrollTrigger.refresh();
      window.setTimeout(() => {
        if (stopped) return;
        broken = brokenPins();
        if (!broken.length) return;
        /**
         * Still wrong after a refresh, so the measurement is not going to come
         * good. Unpinning returns the section to normal document flow: it stops
         * holding open scroll room it is not using, the content sits where it
         * would have anyway, and the page reads top to bottom. A section that
         * does not pin is a small loss; thousands of pixels of empty black is
         * not survivable.
         */
        broken.forEach((t) => t.kill(true));
        ScrollTrigger.refresh();
        sweepReveals();
      }, 400);
    };

    const sweep = () => {
      if (stopped) return;
      sweepReveals();
      repairPins();
    };

    /* Run once the page has had its chance, then keep a light watch: a reveal
       can fall due at any scroll position, and a layout change can re-break a
       pin that was fine a moment ago. */
    const first = window.setTimeout(sweep, GRACE_MS);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!stopped) sweepReveals();
      });
    };
    const onResize = () => window.setTimeout(sweep, 500);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      stopped = true;
      window.clearTimeout(first);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return null;
}
