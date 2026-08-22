"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { leadership, lifeAtAdrak } from "@/lib/content";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

/** Team Adrak — founder feature, adviser, board photo, and full roster. */
export default function Team() {
  const root = useRef<HTMLElement>(null);
  const { founder, adviser, directors, roster } = leadership;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-roster-item]",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-roster]", start: "top 85%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={root} className="relative z-20 bg-forest text-cream overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 w-[50vw] h-[50vh] bg-brand/15 blur-[160px] rounded-full" />

      <div className="shell py-24 md:py-36">
        <Reveal className="text-center mb-16 md:mb-24">
          <p className="label text-gold mb-4">Team Adrak</p>
          <h2 className="font-display h-section">
            The people behind the landmarks
          </h2>
        </Reveal>

        {/* ===== Founder feature ===== */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24 md:mb-32">
          <Reveal className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={founder.img}
                alt={founder.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-7">
                <p className="font-display text-2xl">{founder.name}</p>
                <p className="label text-gold mt-2">{founder.role}</p>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <blockquote className="font-serifit italic text-3xl md:text-4xl leading-snug text-cream/95">
                “{founder.quote}”
              </blockquote>
              <p className="font-light text-cream/70 leading-relaxed mt-8 max-w-xl">
                {founder.bio}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                {founder.honors.map((h) => (
                  <span
                    key={h}
                    className="px-6 py-2.5 border border-gold/40 text-gold rounded-full label"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ===== Adviser + board photo ===== */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-24 md:mb-32">
          <Reveal className="lg:col-span-7 order-2 lg:order-1">
            <div className="grid grid-cols-3 gap-5 md:gap-8">
              {directors.map((d) => (
                <div key={d.name} className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[5/6] mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.img}
                      alt={d.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-display text-base md:text-lg leading-snug">{d.name}</p>
                  <p className="label text-cream/50 mt-2">{d.role}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 order-1 lg:order-2">
            <div className="flex items-center gap-6">
              <div className="relative rounded-2xl overflow-hidden w-36 h-44 md:w-44 md:h-56 flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={adviser.img}
                  alt={adviser.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="font-display text-xl leading-snug">{adviser.name}</p>
                <p className="label text-gold mt-2">{adviser.role}</p>
              </div>
            </div>
            <blockquote className="font-serifit italic text-xl md:text-2xl leading-snug text-cream/85 mt-8">
              “{adviser.quote}”
            </blockquote>
          </Reveal>
        </div>

        {/* ===== Key personnel roster ===== */}
        <Reveal>
          <p className="label text-gold text-center mb-12">Key Personnel</p>
        </Reveal>
        <div
          data-roster
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6 [perspective:1200px]"
        >
          {roster.map((m) => (
            <div
              key={m.name}
              data-roster-item
              className="group transform-gpu transition-transform duration-500 hover:-translate-y-1.5"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[5/6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.img}
                  alt={m.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="font-display text-[clamp(0.9375rem,0.9vw,1.375rem)] leading-snug mt-3.5">
                {m.name}
              </p>
              <p className="label label-xs text-cream/70 mt-1.5">{m.role}</p>
            </div>
          ))}
        </div>

        {/* ===== Life at Adrak ===== */}
        <Reveal className="mt-24 md:mt-32">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <p className="label text-gold mb-5">Life at Adrak</p>
              <h3 className="font-display text-3xl md:text-4xl leading-tight">
                People first,
                <br />
                landmarks follow
              </h3>
              <p className="font-light text-cream/70 leading-relaxed mt-6">
                {lifeAtAdrak.statement}
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 gap-4">
              {lifeAtAdrak.photos.map((ph) => (
                <figure
                  key={ph.src}
                  className="group relative rounded-2xl overflow-hidden bg-ink aspect-[16/10]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.src}
                    alt={ph.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
                  />
                  <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/85 to-transparent px-5 pt-10 pb-4">
                    <span className="label label-xs text-cream/85">
                      {ph.label}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
