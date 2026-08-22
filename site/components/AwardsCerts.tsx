"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { certificates, awards, awardMentions } from "@/lib/content";
import Reveal from "./Reveal";

type Cert = (typeof certificates)[number];

/** Certificates & Awards — ISO certificate scans open in a GSAP lightbox. */
export default function AwardsCerts() {
  const [cert, setCert] = useState<Cert | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cert) return;
    document.documentElement.style.overflow = "hidden";
    const t = gsap.timeline();
    t.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
    t.fromTo(
      sheet.current,
      { autoAlpha: 0, y: 70, scale: 0.92, rotationX: 8, transformPerspective: 1200 },
      { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 0.7, ease: "power3.out" },
      "-=0.15"
    );
    return () => { t.kill(); };
  }, [cert]);

  const close = useCallback(() => {
    const t = gsap.timeline({
      onComplete: () => {
        setCert(null);
        document.documentElement.style.overflow = "";
      },
    });
    t.to(sheet.current, { autoAlpha: 0, y: 50, scale: 0.95, duration: 0.3, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.25 }, "-=0.1");
  }, []);

  useEffect(() => {
    if (!cert) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cert, close]);

  return (
    <section id="awards" className="relative z-20 bg-parchment text-ink border-t border-ink/10">
      <div className="shell py-24 md:py-32">
        <Reveal className="text-center mb-16 md:mb-20">
          <p className="label text-brand mb-4">Certificates & Awards</p>
          <h2 className="font-display h-section">
            Recognised. Certified. Trusted.
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* ===== ISO Certificates — click to view ===== */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label text-taupe mb-8">
                TÜV NORD Certified — click to view
              </p>
            </Reveal>
            <div className="grid grid-cols-3 gap-4 [perspective:1200px]">
              {certificates.map((c, i) => (
                <Reveal key={c.name} delay={i * 0.08} tilt>
                  <button
                    onClick={() => setCert(c)}
                    aria-label={`View ${c.name} certificate`}
                    className="group block w-full text-left cursor-pointer"
                  >
                    <div className="relative rounded-xl overflow-hidden border border-ink/15 shadow-[0_14px_34px_rgba(16,39,26,0.14)] bg-white transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_26px_50px_rgba(16,39,26,0.22)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.img}
                        alt={`${c.name} certificate`}
                        loading="lazy"
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/25 transition-colors duration-500 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 px-5 py-2.5 bg-gold text-ink rounded-full label label-xs font-bold">
                          View
                        </span>
                      </div>
                    </div>
                    <p className="font-display text-[clamp(1rem,0.9vw,1.375rem)] mt-3.5">{c.name}</p>
                    <p className="label label-xs text-taupe mt-1.5">{c.scope}</p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ===== Awards ===== */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label text-taupe mb-8">International Recognition</p>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {awards.map((a, i) => (
                <Reveal key={a.name} delay={i * 0.06} tilt>
                  <div className="group rounded-2xl bg-white border border-ink/10 overflow-hidden hover:border-gold/60 hover:shadow-[0_20px_44px_rgba(16,39,26,0.14)] transform-gpu transition-all duration-500 hover:-translate-y-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.img}
                      alt={a.name}
                      loading="lazy"
                      className="w-full aspect-[2/1.1] object-contain bg-white p-3"
                    />
                    <div className="px-4 py-3 border-t border-ink/10">
                      <p className="font-display text-[clamp(0.9375rem,0.9vw,1.375rem)] leading-snug">{a.name}</p>
                      <p className="label label-xs text-taupe mt-1.5">{a.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="flex flex-wrap gap-3 mt-8">
              {awardMentions.map((m) => (
                <span
                  key={m}
                  className="px-5 py-2.5 border border-ink/15 rounded-full label label-xs text-ink/70 hover:border-gold hover:text-brand transition-colors duration-300"
                >
                  {m}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>

      {/* ===== Certificate lightbox ===== */}
      {cert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div
            ref={backdrop}
            onClick={close}
            className="absolute inset-0 bg-ink/85 backdrop-blur-xl"
          />
          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-label={`${cert.name} certificate`}
            className="relative max-h-[92dvh] overflow-y-auto no-scrollbar rounded-2xl bg-white shadow-[0_60px_140px_rgba(0,0,0,0.7)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.img}
              alt={`${cert.name} certificate — full view`}
              className="block max-h-[82dvh] w-auto"
            />
            <div className="px-6 py-4 border-t border-ink/10 flex items-center justify-between gap-6">
              <div>
                <p className="font-display text-lg text-ink">{cert.name}</p>
                <p className="label label-xs text-taupe mt-1">
                  {cert.scope} · TÜV NORD
                </p>
              </div>
              <a
                href={cert.img}
                target="_blank"
                rel="noopener noreferrer"
                className="label label-xs text-brand hover:text-gold transition-colors flex-none"
              >
                Open Full Size ↗
              </a>
            </div>
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-ink/70 backdrop-blur-md text-cream flex items-center justify-center hover:bg-gold hover:text-ink hover:rotate-90 transition-all duration-400"
            >
              <svg width="13" height="13" viewBox="0 0 14 14">
                <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
