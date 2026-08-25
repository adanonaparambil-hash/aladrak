"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;

/** The live Lenis instance, or null under reduced motion. */
export function getLenis(): Lenis | null {
  return instance;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Re-measure every ScrollTrigger once the page has actually settled.
   *
   * Five sections pin, and a pinned trigger caches the size of the element it
   * pins at the moment it is created. That happens during mount — before the
   * web fonts have swapped in and before images and videos have contributed
   * their heights — so the cached numbers can be wrong, and for a pin they are
   * not merely a bit off: the wrong measurement is baked into the spacer that
   * holds the page open. A section measured at zero width produced a spacer
   * 396,142px tall, which turned a 36,000px page into a 438,000px one with a
   * quarter-million pixels of dead scroll. It was intermittent, because it
   * depended on whether fonts happened to land before or after mount.
   *
   * `sort()` first, because these triggers are created by separate components
   * whose effects do not necessarily run in page order, and GSAP has to refresh
   * pinned triggers top-down for the spacing to come out right.
   *
   * This runs regardless of the reduced-motion branch below: fewer sections pin
   * in that mode, but the ones that do still need honest measurements.
   */
  useEffect(() => {
    let done = false;
    /**
     * A hash arrival must be re-landed after the pins take their true sizes.
     * The browser jumps to the fragment before any pin-spacer exists; once the
     * spacers inflate the page, that early position is thousands of pixels
     * short of the section it named. Re-land after each refresh — unless the
     * visitor has already taken over the scroll, in which case yanking them
     * back would be worse than landing short.
     */
    let hashPending = !!window.location.hash;
    const cancelLanding = () => {
      hashPending = false;
    };
    window.addEventListener("wheel", cancelLanding, { passive: true, once: true });
    window.addEventListener("touchstart", cancelLanding, { passive: true, once: true });

    const settle = () => {
      if (done) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      if (hashPending) {
        const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (el) {
          if (instance) instance.scrollTo(el, { immediate: true });
          else el.scrollIntoView();
        }
      }
    };
    // fonts change text metrics, which changes section heights
    document.fonts?.ready.then(settle).catch(() => settle());
    // load covers images and video metadata
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle);
    return () => {
      done = true;
      window.removeEventListener("load", settle);
      window.removeEventListener("wheel", cancelLanding);
      window.removeEventListener("touchstart", cancelLanding);
    };
  }, []);

  /**
   * Same-page section links travel through Lenis instead of teleporting.
   *
   * Two reasons. A native fragment jump while Lenis is animating gets
   * overwritten by its very next frame write, so the click reads as "nothing
   * happened" — sometimes reported as the page misbehaving on menu clicks. And
   * even when it lands, teleporting through three pinned sections is
   * disorienting; a driven scroll keeps the geography legible. Links to other
   * pages fall through untouched, and under reduced motion (no Lenis) the
   * native jump stands, as it should.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || !instance) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      window.history.pushState(null, "", url.hash);
      instance.scrollTo(target, { duration: 1.4 });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    /**
     * Scroll feel.
     *
     * lerp is how much of the remaining distance is covered each frame, so a
     * lower number is a longer, softer glide. 0.11 arrived quickly and stopped
     * abruptly; 0.085 carries momentum through the pinned sections, which is
     * where the abruptness showed most.
     *
     * wheelMultiplier stays at 1. Dropping it to 0.85 was a mistake: it made
     * every notch of the wheel travel less, which reads as control on a short
     * section but as dragging on the long pinned ones — the map alone holds the
     * page for nearly eight screens, and needing ~18% more wheel to cross it is
     * exactly the "nothing is happening" feeling that was reported.
     */
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return <>{children}</>;
}
