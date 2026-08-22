"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { expertise } from "@/lib/content";
import { motionOK } from "@/lib/intro";

gsap.registerPlugin(ScrollTrigger);

/**
 * Core Expertise — each discipline takes the whole frame.
 *
 * The discipline's own photograph IS the background, with the number, name,
 * lead line and capability list laid straight over it. Scroll cross-fades the
 * four frames, the photo pushes slowly while a frame is held, and the words
 * lift as they swap.
 *
 * This replaced a 3D arrangement of a small image plate and a separate glass
 * capability card floating on black: at 2560 that left most of the screen empty
 * and the photographs were too small to be worth showing.
 *
 * Reduced motion and phones get the stacked layout instead — all four
 * disciplines, all their capabilities, no pinning and no cross-fade.
 */

export default function Expertise() {
  const root = useRef<HTMLElement>(null);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    if (!motionOK()) {
      // stacked layout at every width — nothing to animate, nothing to pin
      setCalm(true);
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const groups = gsap.utils.toArray<HTMLElement>("[data-group]");
        const texts = gsap.utils.toArray<HTMLElement>("[data-text]");
        const n = groups.length;

        /**
         * One shared position drives everything: `pos` is the travelled
         * distance in disciplines, so `pos === i` means discipline i is at rest.
         *
         * The frames do NOT cross-fade. Two photographs at 0.5 opacity each read
         * as mud — which is exactly what the previous pass looked like. Instead
         * they are stacked by index and the incoming one WIPES across with a
         * clip-path, so only ever one photograph is visible at any pixel and the
         * change reads as a deliberate cut rather than a blend.
         */
        const place = (p: number) => {
          const pos = p * (n - 1);
          groups.forEach((g, i) => {
            // group i reveals as pos travels from i-1 to i, then stays put
            const r = i === 0 ? 1 : Math.max(0, Math.min(1, pos - (i - 1)));
            g.style.zIndex = String(i);
            g.style.opacity = "1";
            g.style.visibility = r > 0 ? "visible" : "hidden";
            // eased wipe from the right edge inward
            const eased = r * r * (3 - 2 * r);
            g.style.clipPath = `inset(0 0 0 ${((1 - eased) * 100).toFixed(2)}%)`;
            // a slow push while a frame is held, easing off as it is left behind
            const shot = g.querySelector<HTMLElement>("[data-shot]");
            if (shot) {
              const held = Math.max(0, 1 - Math.abs(pos - i));
              shot.style.transform = `scale(${(1.08 - 0.08 * held).toFixed(4)})`;
            }
          });
          // one discipline named at a time; the glass lifts as it swaps
          texts.forEach((t, i) => {
            const local = pos - i;
            // centred on the midpoint: full to 0.45, gone by 0.55, so the pair
            // only ever overlaps across a hair's breadth and never both vanish
            const o = Math.max(0, Math.min(1, (0.55 - Math.abs(local)) / 0.1));
            t.style.opacity = `${o}`;
            t.style.transform = `translateY(${(-local * 28).toFixed(1)}px)`;
            t.style.visibility = o < 0.01 ? "hidden" : "visible";
          });
          gsap.set("[data-progress]", { scaleX: 0.1 + p * 0.9 });
        };

        place(0);

        const cam = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: `+=${n * 100}%`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.6,
          },
        });
        tl.to(cam, { p: 1, ease: "none", onUpdate: () => place(cam.p) });

        return () => {
          groups.forEach((g) => g.removeAttribute("style"));
          texts.forEach((t) => t.removeAttribute("style"));
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const stacked = (
    <div className={`${calm ? "" : "md:hidden "}px-6 py-24 space-y-16`}>
      <div>
        <p className="label text-gold mb-4">Core Expertise</p>
        <h2 className="font-display text-4xl">One team. Four disciplines.</h2>
      </div>
      {expertise.map((d) => (
        <div key={d.key} className="border-t border-white/10 pt-10">
          <div className="font-display text-7xl text-transparent [-webkit-text-stroke:1px_var(--color-gold)]">
            {d.no}
          </div>
          <h3 className="font-display text-3xl mt-3">{d.title}</h3>
          <p className="font-serifit italic text-xl text-cream/70 mt-2">{d.lead}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.img}
            alt={d.title}
            loading="lazy"
            style={{ objectPosition: d.imgPos }}
            className="mt-5 rounded-xl w-full aspect-video object-cover border border-white/10"
          />
          <ul className="mt-6 space-y-4">
            {d.points.map((p, i) => (
              <li key={i} className="flex gap-4 text-cream/85 font-light">
                <span className="label text-gold mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <section id="expertise" ref={root} className="relative z-10 bg-ink text-cream">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-brand/10 blur-[140px] rounded-full" />

      {/* ===== the stage: each discipline is the full frame ===== */}
      {!calm && (
        <div data-pin className="hidden md:block relative h-screen overflow-hidden">
          {/* one full-bleed layer per discipline, cross-faded on scroll */}
          {expertise.map((d) => (
            <div key={d.key} data-group className="absolute inset-0" style={{ willChange: "opacity" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-shot
                src={d.img}
                alt={d.title}
                loading="lazy"
                style={{ objectPosition: d.imgPos }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Light touch only — enough to seat the photo in the page, not
                  enough to bury it. Legibility is the glass panels' job now; a
                  scrim heavy enough to carry the type on its own turned the
                  whole frame to mud. */}
              <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/35" />
            </div>
          ))}

          {/* header */}
          <div className="absolute top-0 inset-x-0 z-20 shell pt-20 flex items-end justify-between">
            <div>
              <p className="label text-gold mb-4">Core Expertise</p>
              <h2 className="font-display text-4xl lg:text-5xl">
                One team. Four disciplines.
              </h2>
            </div>
            <p className="label text-cream/60 max-w-xs text-right leading-loose">
              Turnkey solutions with 100% in-house facilities
            </p>
          </div>

          {/* the content, laid straight on the image — no card, no glass */}
          <div className="absolute inset-0 z-20 shell flex items-center pointer-events-none">
            <div className="relative w-full grid grid-cols-12 gap-10 items-center">
              {expertise.map((d) => (
                <div
                  key={d.key}
                  data-text
                  className="absolute inset-x-0 grid grid-cols-12 gap-10 items-center"
                >
                  <div className="col-span-6">
                    <div className="inline-block rounded-3xl bg-ink/45 backdrop-blur-lg border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.4)] px-9 py-8">
                      <div className="font-display text-[clamp(5rem,9vw,13rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-gold)] opacity-90">
                        {d.no}
                      </div>
                      <h3 className="font-display text-[clamp(2rem,3.4vw,5rem)] leading-[1.05] mt-3">
                        {d.title}
                      </h3>
                      <p className="font-serifit italic text-cream/85 text-[clamp(1.125rem,1.5vw,2rem)] mt-4">
                        {d.lead}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-5 col-start-8 rounded-3xl bg-ink/45 backdrop-blur-lg border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.4)] px-8 py-7">
                    <p className="label text-gold mb-5">Capability</p>
                    <ul className="divide-y divide-cream/15">
                      {d.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-5 py-3.5">
                          <span className="label label-xs text-gold/80 mt-1.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[clamp(0.9375rem,0.95vw,1.375rem)] leading-snug text-cream/90 font-light">
                            {pt}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 z-20 shell pb-10">
            <div className="h-px bg-white/15 w-full overflow-hidden">
              <div data-progress className="h-px bg-gold origin-left" style={{ transform: "scaleX(0.1)" }} />
            </div>
          </div>
        </div>
      )}

      {/* ===== stacked: mobile always, and every width when motion is reduced ===== */}
      {stacked}
    </section>
  );
}
