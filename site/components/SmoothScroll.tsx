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
    const settle = () => {
      if (done) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    // fonts change text metrics, which changes section heights
    document.fonts?.ready.then(settle).catch(() => settle());
    // load covers images and video metadata
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle);
    return () => {
      done = true;
      window.removeEventListener("load", settle);
    };
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
     * wheelMultiplier below 1 shortens each notch of the wheel, which is what
     * stops a single flick throwing the page a whole screen and makes long
     * sections feel controlled rather than skittish.
     */
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.85,
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
