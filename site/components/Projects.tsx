"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/lib/content";
import Reveal from "./Reveal";
import { openProject } from "./ProjectModal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop: pinned horizontal gallery — vertical scroll drives sideways travel.
 * Mobile: native snap carousel.
 */
export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = track.current;
        if (!el) return;
        const travel = () => -(el.scrollWidth - window.innerWidth);
        /**
         * PACE is how much vertical scroll the horizontal travel costs.
         *
         * At 1:1 the pin held for 6,845px at 2560 — roughly six screen-heights
         * with the page apparently stuck, which is what "the scroll is blocking"
         * means. The cards are large and there are thirteen of them, so the
         * track is ~9,400px wide; mapping that 1:1 was never going to be
         * comfortable. At 0.4 the track still travels its full width, just over
         * 2.4 screens of scroll instead of six.
         */
        const PACE = 0.4;
        gsap.to(el, {
          x: travel,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-hwrap]",
            start: "top top",
            end: () => `+=${(el.scrollWidth - window.innerWidth) * PACE}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const Card = ({ p }: { p: (typeof projects)[number] }) => (
    <article
      onClick={() => openProject(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openProject(p)}
      aria-label={`View ${p.name} details`}
      className="group relative flex-none w-[78vw] sm:w-[55vw] md:w-auto md:h-[calc(100vh-19rem)] aspect-[4/5] rounded-2xl overflow-hidden snap-center bg-forest cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.img}
        alt={p.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-ink/10" />
      <span className="absolute top-5 left-5 bg-white/10 backdrop-blur-md border border-white/25 text-cream px-5 py-2 rounded-full label label-xs">
        {p.sector}
      </span>
      {/* view hint */}
      <span className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-400">
        <svg width="13" height="13" viewBox="0 0 13 13">
          <path d="M2 11 L11 2 M4.5 2 H11 V8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
        <h3 className="font-display text-2xl md:text-[28px] leading-tight text-cream">
          {p.name}
        </h3>
        <p className="label text-gold mt-3">{p.place}</p>
        <p className="text-[clamp(0.875rem,0.85vw,1.0625rem)] text-cream/85 font-light leading-relaxed mt-4 md:max-h-0 md:opacity-0 md:group-hover:max-h-32 md:group-hover:opacity-100 transition-all duration-500 overflow-hidden">
          {p.desc}
        </p>
      </div>
    </article>
  );

  return (
    <section id="projects" ref={root} className="relative z-10 bg-pine text-cream">
      {/* ===== Desktop: pinned horizontal ===== */}
      <div data-hwrap className="hidden md:block h-screen overflow-hidden">
        <div className="shell pt-28 pb-10 flex items-end justify-between">
          <div>
            <p className="label text-gold mb-4">Portfolio</p>
            <h2 className="font-display text-[clamp(2.25rem,3.6vw,5.5rem)] leading-[1.05]">
              Landmarks across the Sultanate
            </h2>
          </div>
          <p className="label text-cream/70">450+ delivered · scroll →</p>
        </div>
        <div ref={track} className="flex gap-8 pl-[clamp(1.5rem,3vw,5.5rem)] pr-24 will-change-transform">
          {projects.map((p) => (
            <Card key={p.name} p={p} />
          ))}
          {/* end card */}
          <a
            href="#contact"
            className="group relative flex-none w-auto h-[calc(100vh-19rem)] aspect-[4/5] rounded-2xl border border-white/15 flex flex-col items-center justify-center gap-6 hover:border-gold transition-colors duration-500"
          >
            <span className="font-display text-4xl text-center leading-snug px-10">
              Your landmark
              <br />
              is next
            </span>
            <span className="px-8 py-4 bg-gold text-ink rounded-full label font-bold">
              Start a Project
            </span>
          </a>
        </div>
      </div>

      {/* ===== Mobile: snap carousel ===== */}
      <div className="md:hidden py-24">
        <Reveal className="px-6 mb-10">
          <p className="label text-gold mb-4">Portfolio</p>
          <h2 className="font-display text-4xl">
            Landmarks across the Sultanate
          </h2>
          <p className="label text-cream/70 mt-4">swipe →</p>
        </Reveal>
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 pb-4">
          {projects.map((p) => (
            <Card key={p.name} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
