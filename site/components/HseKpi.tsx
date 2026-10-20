"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hse } from "@/lib/content";
import { motionOK } from "@/lib/intro";

gsap.registerPlugin(ScrollTrigger);

/**
 * The HSE record, counted up as the section arrives.
 *
 * The numbers are rendered at their FINAL value and only wound back to zero at
 * the moment the count actually starts. That ordering is deliberate and is the
 * lesson from the reduced-motion fault earlier in this build: a figure that
 * starts at zero and waits for an animation reads as "0 safe man hours" to
 * anyone whose animation never runs — no JavaScript, a stalled ticker, reduced
 * motion. Here the worst case is simply a number that does not animate, which
 * is the right worst case for a safety record.
 *
 * `toLocaleString` throughout, so seventeen million is legible rather than a
 * wall of digits; the same treatment the anniversary dial uses on the homepage.
 */
export default function HseKpi() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionOK()) return;

    const ctx = gsap.context(() => {
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () => {
          counters.forEach((node) => {
            const target = Number(node.dataset.count || "0");
            // a zero needs no count; leave it be rather than animate nothing
            if (!target) return;
            const obj = { v: 0 };
            node.textContent = "0";
            gsap.to(obj, {
              v: target,
              // the big running totals take longer, so the eye has time to read
              // the magnitude rather than just see a blur settle
              duration: target > 1000 ? 2.1 : 1.1,
              ease: "power2.out",
              onUpdate: () => {
                node.textContent = Math.round(obj.v).toLocaleString("en-GB");
              },
              onComplete: () => {
                node.textContent = target.toLocaleString("en-GB");
              },
            });
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const { lead, asAt, headline, zero, incidents } = hse.kpi;

  return (
    <section ref={root} className="relative bg-forest text-cream overflow-hidden">
      {/* a single soft bloom, so the band reads as a feature rather than a table */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] w-[46rem] h-[46rem] rounded-full blur-[150px] bg-brand/20"
      />

      <div className="relative shell py-24 md:py-32">
        <p className="label text-gold mb-5">The record</p>
        <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] max-w-3xl">
          Seventeen million hours, nobody lost
        </h2>
        <p className="mt-6 max-w-2xl text-cream/75 font-light leading-relaxed text-[clamp(1rem,1.1vw,1.15rem)]">
          {lead}
        </p>

        {/* the two running totals */}
        <div className="mt-14 grid sm:grid-cols-2 gap-10 md:gap-14">
          {headline.map((k) => (
            <div key={k.label} className="border-t border-cream/15 pt-6">
              <p
                data-count={k.value}
                className="font-display tabular-nums leading-none text-[clamp(2.6rem,6vw,4.75rem)] text-gold"
              >
                {k.value.toLocaleString("en-GB")}
              </p>
              <p className="label label-xs text-cream/60 mt-4">{k.label}</p>
            </div>
          ))}
        </div>

        {/* the two that matter most */}
        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {zero.map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-gold/30 bg-gold/[0.07] px-7 py-7 flex items-baseline gap-5"
            >
              <p className="font-display tabular-nums leading-none text-[clamp(2.4rem,5vw,3.75rem)] text-gold">
                {k.value}
              </p>
              <div>
                <p className="label label-xs text-cream/85">{k.label}</p>
                <p className="label label-xs text-cream/45 mt-1.5">to date</p>
              </div>
            </div>
          ))}
        </div>

        {/* everything that was not zero, recorded */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
          {incidents.map((k) => (
            <div key={k.label} className="border-t border-cream/12 pt-5">
              <p className="font-display tabular-nums leading-none text-2xl md:text-3xl text-cream">
                <span data-count={k.value}>{k.value}</span>
                {k.note ? (
                  <span className="label label-xs text-cream/45 ml-2.5 align-middle">{k.note}</span>
                ) : null}
              </p>
              <p className="label label-xs text-cream/55 mt-3 leading-relaxed">{k.label}</p>
            </div>
          ))}
        </div>

        <p className="label label-xs text-cream/40 mt-14">{asAt}</p>
      </div>
    </section>
  );
}
