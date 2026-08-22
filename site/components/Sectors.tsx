"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sectors } from "@/lib/content";
import Reveal from "./Reveal";
import StripNav from "./StripNav";

gsap.registerPlugin(ScrollTrigger);

/** Sectors We Serve — 11 sectors from the brochure, snap-scroll strip
 *  with a gentle GSAP drift as the section scrolls into view. */
export default function Sectors() {
  const root = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-scard]",
        { autoAlpha: 0, y: 60, rotationX: 10, transformPerspective: 900 },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: strip.current, start: "top 88%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative z-10 bg-ink text-cream border-t border-white/5 overflow-hidden">
      <div className="shell pt-24 md:pt-32 pb-6">
        <Reveal>
          <div className="grid md:grid-cols-12 md:items-end gap-8">
            <div className="md:col-span-8">
              <p className="label text-gold mb-4">Sectors We Serve</p>
              <h2 className="font-display h-section">
                Eleven sectors.
                <br />
                One standard.
              </h2>
            </div>
            <div className="pb-2 md:col-span-3 md:col-start-10 flex md:justify-end text-cream/70">
              <StripNav target={strip} label="sector" />
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={strip}
        className="flex gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory no-scrollbar px-6 md:px-[clamp(1.5rem,3vw,5.5rem)] pb-24 md:pb-32 pt-8 [perspective:1200px]"
      >
        {sectors.map((s, i) => (
          <article
            key={s.name}
            data-scard
            className="group relative flex-none w-[70vw] sm:w-[40vw] md:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden snap-center bg-forest transform-gpu transition-transform duration-500 hover:[transform:rotateX(2deg)_rotateY(-2deg)_scale(1.02)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.img}
              alt={s.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-ink/10" />
            <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center label text-gold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="font-display text-xl leading-tight">{s.name}</h3>
              <p className="text-[clamp(0.8125rem,0.85vw,1.0625rem)] text-cream/80 font-light leading-relaxed mt-2.5">
                {s.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
