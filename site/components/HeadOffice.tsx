"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { headOffice } from "@/lib/content";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

/** Head Office showcase — full-screen building backdrop with GSAP parallax
 *  and a glassmorphism information panel. */
export default function HeadOffice() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Overscale is what the parallax travels through, but 1.18 plus a +/-10%
      // slide was cropping a third of the building away on a wide screen. The
      // source (1800x1200) is a full frontal shot: the building spans roughly
      // 35%-83% of the frame height, so a gentle 1.04 / +/-2% keeps all of it
      // inside the visible window at every landscape aspect.
      gsap.fromTo(
        bg.current,
        { yPercent: -2, scale: 1.04 },
        {
          yPercent: 2,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      /* The frame's aspect is what crops the photo: object-cover on a 2.23-wide
         viewport against a 1.50 source threw away a third of the building's
         height. Letting the section grow taller than the viewport on wide
         screens pulls the frame back toward the source's shape — 67% of the
         image height visible at 2560 becomes ~79% — without the ink side-bands
         that object-contain would leave. */
      className="relative z-20 bg-ink text-cream overflow-hidden min-h-[max(100svh,calc(100vw/2))] flex items-center"
    >
      {/* The building — hero of this section */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bg}
          src={headOffice.img}
          alt="The Al Adrak head office campus at Halban, Muscat, seen from the air"
          className="w-full h-full object-cover object-[center_45%] will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/40" />
      </div>

      <div className="relative shell py-28 md:py-40 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Glass info panel */}
          <Reveal tilt>
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-9 md:p-12">
              <p className="label text-gold mb-6">
                Head Office · Corporate Command
              </p>
              <h2 className="font-display h-section">
                {headOffice.title}
              </h2>
              <p className="label text-cream/70 mt-6">{headOffice.location}</p>
              <p className="font-light text-cream/85 leading-relaxed text-[17px] mt-8">
                {headOffice.body}
              </p>
              <div className="flex flex-wrap gap-3 mt-9">
                {["Project Management", "Design & CAD", "Procurement & Logistics", "IT & Finance", "Facility Management"].map((t) => (
                  <span
                    key={t}
                    className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full label label-xs text-cream/85"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* The building itself, shown complete */}
          <Reveal delay={0.15} tilt className="lg:justify-self-end w-full max-w-[min(34vw,620px)]">
            <figure className="rounded-2xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headOffice.img2}
                alt="The Al Adrak head office building at Halban, seen from the front"
                className="w-full h-auto"
              />
              <figcaption className="label text-cream/70 px-6 py-4">
                The Head Office at Halban — the full frontal elevation
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
