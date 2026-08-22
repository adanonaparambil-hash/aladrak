"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Project } from "@/lib/content";

/** Dispatch from any card to open the detail view. */
export function openProject(p: Project) {
  window.dispatchEvent(new CustomEvent("openProject", { detail: p }));
}

/** GSAP-animated project detail overlay — glass backdrop, cinematic image,
 *  staggered content. Close: ×, ESC, or backdrop click. */
export default function ProjectModal() {
  const [proj, setProj] = useState<Project | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => setProj((e as CustomEvent<Project>).detail);
    window.addEventListener("openProject", onOpen);
    return () => window.removeEventListener("openProject", onOpen);
  }, []);

  // animate in whenever a project is set
  useEffect(() => {
    if (!proj) return;
    document.documentElement.style.overflow = "hidden";
    const t = gsap.timeline();
    t.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
    t.fromTo(
      panel.current,
      { autoAlpha: 0, y: 90, scale: 0.94, rotationX: 6, transformPerspective: 1200 },
      { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 0.8, ease: "power3.out" },
      "-=0.25"
    );
    t.fromTo(img.current, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: "power2.out" }, "-=0.8");
    t.fromTo(
      "[data-modal-stagger]",
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" },
      "-=1.3"
    );
    tl.current = t;
    return () => {
      t.kill();
    };
  }, [proj]);

  const close = useCallback(() => {
    const t = gsap.timeline({
      onComplete: () => {
        setProj(null);
        document.documentElement.style.overflow = "";
      },
    });
    t.to(panel.current, { autoAlpha: 0, y: 60, scale: 0.96, duration: 0.35, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.3 }, "-=0.15");
  }, []);

  useEffect(() => {
    if (!proj) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [proj, close]);

  if (!proj) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Glass backdrop */}
      <div
        ref={backdrop}
        onClick={close}
        className="absolute inset-0 bg-ink/80 backdrop-blur-xl"
      />

      {/* Panel */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={proj.name}
        className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-forest border border-white/15 shadow-[0_60px_140px_rgba(0,0,0,0.7)] grid md:grid-cols-2"
      >
        {/* Image side */}
        <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={img}
            src={proj.img}
            alt={proj.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-forest/60" />
        </div>

        {/* Content side */}
        <div className="relative p-8 md:p-12 text-cream">
          <span
            data-modal-stagger
            className="inline-block bg-white/10 backdrop-blur-md border border-white/25 px-5 py-2 rounded-full label label-xs"
          >
            {proj.sector}
          </span>
          <h3
            data-modal-stagger
            className="font-display text-3xl md:text-[42px] leading-[1.08] mt-6"
          >
            {proj.name}
          </h3>
          <p data-modal-stagger className="label text-gold mt-4">
            {proj.place}
          </p>
          <p
            data-modal-stagger
            className="font-light text-cream/80 leading-relaxed mt-6"
          >
            {proj.desc}
          </p>

          {proj.specs && (
            <ul data-modal-stagger className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {proj.specs.map((s, i) => (
                <li key={i} className="flex items-start gap-4 py-3.5">
                  <span className="label text-gold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[clamp(0.90625rem,0.85vw,1.1875rem)] text-cream/85 font-light leading-relaxed">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <a
            data-modal-stagger
            href="#contact"
            onClick={close}
            className="inline-flex mt-9 px-9 py-4 bg-gold text-ink rounded-full label font-bold hover:shadow-[0_0_30px_rgba(201,155,69,0.4)] transition-shadow duration-500"
          >
            Discuss a Similar Project
          </a>
        </div>

        {/* Close */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/50 backdrop-blur-md border border-white/25 text-cream flex items-center justify-center hover:bg-gold hover:text-ink hover:rotate-90 transition-all duration-400 z-10"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
