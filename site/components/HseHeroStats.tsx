"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useText } from "@/lib/translate-client";
import { useContentFor } from "@/lib/i18n-client";
import { motionOK } from "@/lib/intro";

/**
 * The two running totals, on the safety page's opening screen.
 *
 * Two floating glass cards over the open side of the photograph. The look is
 * CSS (.glass-card in globals.css: frosted blur, a light that travels round
 * the edge, a pane of light sliding across, shimmering gold figures, drifting
 * glow and rising sparks) and the movement that needs a clock is GSAP: the
 * entrance, the count, a slow float, and a tilt that follows the pointer.
 *
 * The rule from the band lower on the page still holds: the markup holds the
 * FINAL figure and is wound back to zero only when the count starts, so
 * anyone whose animation never runs — reduced motion, a stalled ticker — reads
 * the true number, not a zero that was waiting to be animated. Float and tilt
 * are decoration and are skipped under reduced motion along with the rest.
 */

/** small line icons, drawn here so the cards carry no extra image requests */
const ICONS = [
  // a clock — hours
  <svg key="h" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>,
  // a road — kilometres
  <svg key="k" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M8 3 4 21M16 3l4 18M12 4v3M12 11v3M12 18v3" />
  </svg>,
];

const SPARKS = [
  { left: "12%", bottom: "8%", delay: "0s" },
  { left: "34%", bottom: "20%", delay: "1.4s" },
  { left: "58%", bottom: "6%", delay: "2.7s" },
  { left: "78%", bottom: "24%", delay: "0.8s" },
  { left: "90%", bottom: "10%", delay: "3.6s" },
  { left: "46%", bottom: "30%", delay: "4.5s" },
];

export default function HseHeroStats() {
  const textForLocale = useText();
  const { hse } = useContentFor();
  const { headline, toDate } = hse.kpi;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionOK()) return;

    let teardown: (() => void) | undefined;
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-count]");
      const bars = gsap.utils.toArray<HTMLElement>("[data-hero-bar]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-glass]");

      // the cards rise in one after the other, then the figures run
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 44, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, delay: 0.45, stagger: 0.22, ease: "power3.out" }
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

      // a slow float, each card on its own beat so they never move as one
      cards.forEach((card, i) => {
        gsap.to(card, {
          y: i === 0 ? -9 : 9,
          duration: 3.4 + i * 0.7,
          delay: 1.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // a tilt that follows the pointer — only where there is a precise one
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const tilts = cards.map((card) => ({
          rx: gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" }),
          ry: gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" }),
        }));
        gsap.set(cards, { transformPerspective: 900 });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
          tilts.forEach((t) => {
            t.ry(nx * 7);
            t.rx(-ny * 6);
          });
        };
        const leave = () => tilts.forEach((t) => (t.rx(0), t.ry(0)));
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        teardown = () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      }
    }, el);

    return () => {
      teardown?.();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={root}
      className="hse-hero-stats relative mt-12 xl:mt-0 xl:absolute xl:end-[clamp(1.5rem,3vw,5.5rem)] xl:bottom-0 w-full max-w-md xl:w-[25rem] space-y-5 [text-shadow:none]"
    >
      {/* light behind the glass, so the blur has something to refract */}
      <span aria-hidden className="glass-orb -top-10 -start-12 h-44 w-44 bg-gold/45" />
      <span
        aria-hidden
        className="glass-orb -bottom-12 -end-8 h-52 w-52 bg-brand/50"
        style={{ animationDelay: "-5s" }}
      />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="glass-spark"
          style={{ insetInlineStart: s.left, bottom: s.bottom, animationDelay: s.delay }}
        />
      ))}

      {headline.map((k, i) => (
        <div
          key={k.label}
          data-glass
          className={`glass-card px-7 py-6 ${i === 1 ? "xl:ms-10" : ""}`}
          style={{ ["--glint-delay" as string]: `${1.8 + i * 2.2}s` }}
        >
          <div className="relative z-[3] flex items-center justify-between">
            <p className="label label-xs text-cream/85 flex items-center gap-2.5">
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              {textForLocale(k.label)}
            </p>
            <span aria-hidden className="text-gold/80">{ICONS[i] ?? ICONS[0]}</span>
          </div>

          <p
            data-hero-count={k.value}
            dir="ltr"
            className="glass-num relative z-[3] mt-5 font-display tabular-nums leading-none text-[clamp(2.5rem,4.1vw,3.4rem)] text-start"
          >
            {k.value.toLocaleString("en-GB")}
          </p>

          <div className="relative z-[3] mt-5 h-[3px] w-full rounded-full bg-cream/15 overflow-hidden">
            <div
              data-hero-bar
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-gold/40 via-gold to-[#f6e7b0]"
            />
          </div>
          <p className="label label-xs text-cream/60 mt-3.5 relative z-[3]">
            {textForLocale(hse.kpi.kickerLabel)} · {textForLocale(toDate)}
          </p>
        </div>
      ))}
    </div>
  );
}
