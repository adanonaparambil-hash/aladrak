"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { moreProjects, projectNames } from "@/lib/content";
import Reveal from "./Reveal";
import { openProject } from "./ProjectModal";
import CurrentPortfolio from "./CurrentPortfolio";

gsap.registerPlugin(ScrollTrigger);

/** Extended portfolio — cream curtain sliding over the dark gallery,
 *  masonry-style grid with staggered GSAP reveals + name wall. */
export default function PortfolioGrid() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-gcard]").forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            autoAlpha: 0,
            y: 90,
            rotationX: 15,
            transformPerspective: 900,
            transformOrigin: "center bottom",
          },
          {
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            duration: 1.2,
            delay: (i % 3) * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative z-20 bg-cream text-ink rounded-t-[2.5rem] md:rounded-t-[4rem] -mt-10 shadow-[0_-30px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="shell py-24 md:py-32">
        <Reveal>
          <div className="grid md:grid-cols-12 md:items-end gap-8 mb-16 md:mb-20">
            <div className="md:col-span-7">
              <p className="label text-brand mb-4">The Wider Portfolio</p>
              <h2 className="font-display h-section">
                Every sector.
                <br />
                Every governorate.
              </h2>
            </div>
            <p className="md:col-span-4 md:col-start-9 text-ink/75 text-[clamp(1rem,0.95vw,1.25rem)] font-light leading-relaxed">
              From ministries to factories, campuses to villages — a selection
              from more than 450 delivered projects, and the sixteen in
              delivery across Oman today.
            </p>
          </div>
        </Reveal>

        {/* Masonry-ish grid */}
        {/* Every 7th card spans two rows, so a block is 1 tall + 6 regular = 8
            cells. That tiles exactly into 4 columns (2 rows x 4) but leaves
            holes in 3, which is why the wide layout looked gappy. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 [perspective:1200px]">
          {moreProjects.map((p, i) => (
            <article
              key={p.name}
              data-gcard
              onClick={() => openProject(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openProject(p)}
              aria-label={`View ${p.name} details`}
              className={`group relative rounded-2xl overflow-hidden bg-forest cursor-pointer transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_scale(1.015)] ${
                i % 7 === 0 ? "row-span-2 aspect-[3/4.5]" : "aspect-[4/3]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />
              <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/25 text-cream px-4 py-1.5 rounded-full label label-xs">
                {p.sector}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <h3 className="font-display text-lg md:text-[22px] leading-tight text-cream">
                  {p.name}
                </h3>
                <p className="label text-gold mt-2">{p.place}</p>
                <p className="hidden sm:block text-[clamp(0.8125rem,0.85vw,1.0625rem)] text-cream/80 font-light leading-relaxed mt-3">
                  {p.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* The live register — sixteen jobs currently on site, in the same
            card language as the grid above and under the same heading; a
            hairline and a small label are the only seam. The section reads
            past -> present -> the long tail. */}
        <CurrentPortfolio />

        {/* Name wall */}
        <Reveal className="mt-20 md:mt-28">
          <p className="label text-brand text-center mb-10">
            …and the story continues
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 max-w-[1500px] mx-auto">
            {projectNames.map((n) => (
              <span
                key={n}
                className="px-6 py-3 border border-ink/20 rounded-full text-[clamp(0.9375rem,1.05vw,1.3125rem)] text-ink/85 hover:border-gold hover:text-brand transition-colors duration-300"
              >
                {n}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
