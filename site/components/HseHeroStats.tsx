"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useText } from "@/lib/translate-client";
import { useContentFor } from "@/lib/i18n-client";
import { motionOK } from "@/lib/intro";

/**
 * The two running totals, counted up on the safety page's opening screen.
 *
 * The right of the hero is open photograph, and these are the figures the whole
 * page argues from, so they sit there from the first second rather than waiting
 * further down for a scroll to reach them. The band lower on the page keeps its
 * own copy of the same numbers, with the rest of the record around them.
 *
 * Same rule as that band: the markup holds the FINAL figure, and it is wound
 * back to zero only at the moment the count starts. A visitor whose animation
 * never runs — reduced motion, a stalled ticker — sees the true number, not a
 * zero that was waiting to be animated.
 */
export default function HseHeroStats() {
  const textForLocale = useText();
  const { hse } = useContentFor();
  const { headline, toDate } = hse.kpi;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionOK()) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-count]");
      const bars = gsap.utils.toArray<HTMLElement>("[data-hero-bar]");

      // the panel rises in, then the figures run once it has settled
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        bars,
        { scaleX: 0 },
        { scaleX: 1, duration: 2.6, delay: 0.9, ease: "power2.out", stagger: 0.25 }
      );

      nodes.forEach((node, i) => {
        const target = Number(node.dataset.heroCount || "0");
        if (!target) return;
        const obj = { v: 0 };
        node.textContent = "0";
        gsap.to(obj, {
          v: target,
          duration: 2.6,
          delay: 0.9 + i * 0.25,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = Math.round(obj.v).toLocaleString("en-GB");
          },
          onComplete: () => {
            node.textContent = target.toLocaleString("en-GB");
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="mt-12 xl:mt-0 xl:absolute xl:end-[clamp(1.5rem,3vw,5.5rem)] xl:bottom-0 w-full max-w-md xl:w-[24rem] rounded-2xl border border-gold/30 bg-ink/55 backdrop-blur-md px-7 py-7 [text-shadow:none]"
    >
      <p className="label label-xs text-gold flex items-center gap-2.5">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
        </span>
        {textForLocale(hse.kpi.kickerLabel)} · {textForLocale(toDate)}
      </p>

      <div className="mt-6 space-y-7">
        {headline.map((k) => (
          <div key={k.label}>
            <p
              data-hero-count={k.value}
              dir="ltr"
              className="font-display tabular-nums leading-none text-[clamp(2.6rem,4.4vw,3.6rem)] text-gold text-start"
            >
              {k.value.toLocaleString("en-GB")}
            </p>
            <div className="mt-3 h-px w-full bg-cream/15 overflow-hidden">
              <div data-hero-bar className="h-full w-full origin-left bg-gold/80" />
            </div>
            <p className="label label-xs text-cream/80 mt-3">{textForLocale(k.label)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
