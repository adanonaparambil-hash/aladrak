"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { facilities, shopFloor } from "@/lib/content";
import { openFacilityMedia } from "./FacilityMedia";
import StripNav from "./StripNav";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

/** In-house production facilities — photo cards with glass badges,
 *  revealed with a staggered 3D flip-up. */
export default function Facilities() {
  const root = useRef<HTMLElement>(null);
  const reel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-fcard]").forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            autoAlpha: 0,
            y: 90,
            rotationX: 16,
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
    <section id="facilities" ref={root} className="relative z-20 bg-parchment text-ink">
      <div className="shell py-24 md:py-32">
        <Reveal>
          <div className="grid md:grid-cols-12 md:items-end gap-8 mb-16 md:mb-20">
            <div className="md:col-span-7">
              <p className="label text-brand mb-4">Support Facilities</p>
              <h2 className="font-display h-section">
                Everything in-house.
                <br />
                Nothing left to chance.
              </h2>
            </div>
            <p className="md:col-span-4 md:col-start-9 text-taupe font-light leading-relaxed">
              Ten dedicated production and support facilities give Al Adrak
              complete control over quality, cost and time — a rare industry
              blend of true turnkey capability.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 [perspective:1200px]">
          {facilities.map((f, i) => (
            <article
              key={f.name}
              data-fcard
              className="group relative rounded-2xl overflow-hidden bg-ink aspect-[4/3] transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_scale(1.015)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.img}
                alt={f.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              {/* glass number badge */}
              <span className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center label text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-xl md:text-2xl text-cream">
                  {f.name}
                </h3>
                <p className="text-[clamp(0.8125rem,0.85vw,1.0625rem)] text-cream/80 font-light leading-relaxed mt-2.5 max-w-md">
                  {f.desc}
                </p>
              </div>
            </article>
          ))}

          {/* CTA tile to keep the grid even */}
          <a
            data-fcard
            href="#contact"
            className="group relative rounded-2xl aspect-[4/3] border border-ink/15 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center gap-5 hover:border-gold transition-colors duration-500"
          >
            <span className="font-display text-2xl md:text-3xl text-center leading-snug px-8 text-ink">
              100% in-house.
              <br />
              Zero compromise.
            </span>
            <span className="px-7 py-3.5 bg-forest text-cream rounded-full label font-bold group-hover:bg-brand transition-colors duration-300">
              Talk to Us
            </span>
          </a>
        </div>

        {/* ===== Inside the facilities — live media gallery ===== */}
        <Reveal className="mt-20 md:mt-24">
          <div className="flex items-end justify-between gap-6 mb-8">
            <h3 className="font-display text-2xl md:text-4xl">
              Step inside our factories
            </h3>
            <div className="hidden md:flex items-center gap-6 text-taupe">
              <p className="label">live from the shop floor</p>
              <StripNav target={reel} label="factory clip" />
            </div>
          </div>
        </Reveal>
        <div
          ref={reel}
          className="flex gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory no-scrollbar -mx-6 px-6 pb-4"
        >
          {shopFloor.map((m, i) => (
            <figure
              key={m.src}
              onClick={() => openFacilityMedia(i)}
              role="button"
              tabIndex={0}
              aria-label={`View ${m.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFacilityMedia(i);
                }
              }}
              className="group relative flex-none w-[75vw] sm:w-[46vw] lg:w-[31rem] aspect-video rounded-2xl overflow-hidden snap-center bg-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {m.type === "video" ? (
                <video
                  src={m.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.src}
                  alt={m.label}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {/* the affordance the tiles were missing entirely */}
              <span className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/55 backdrop-blur-md border border-cream/25 flex items-center justify-center text-cream opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                  <path
                    d="M2 13 L13 2 M5.5 2 H13 V9.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/85 to-transparent px-6 pt-10 pb-4">
                <span className="label text-cream/90">{m.label}</span>
                {m.type === "video" && (
                  <span className="ml-3 inline-flex items-center gap-1.5 label label-xs text-gold">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    Live
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
