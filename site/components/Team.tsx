"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { leadership, lifeAtAdrak, type Person } from "@/lib/content";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * A portrait, or a monogram where there is no photograph yet.
 *
 * Four of the twenty-three have no picture on file. A missing <img> would leave
 * a broken tile and a ragged grid, and a generic silhouette would look like an
 * error; initials in the display face read as deliberate and keep the row
 * rhythm intact. Supplying the photograph later is a one-word change in
 * content.ts — null becomes a path — with nothing to alter here.
 */
function Portrait({ person }: { person: Person }) {
  if (person.img) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={person.img}
        alt={person.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  const initials = person.name
    .replace(/^(Dr\.|Adv\.|Mr\.|Ms\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      aria-label={person.name}
      role="img"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest to-ink border border-cream/10"
    >
      <span className="font-display text-[clamp(1.75rem,3.2vw,3rem)] text-gold/70 tracking-wide">
        {initials}
      </span>
    </div>
  );
}

/** Team Adrak — founder feature, executive directors, and the full roster. */
export default function Team() {
  const root = useRef<HTMLElement>(null);
  const { founder, directors, roster } = leadership;

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
        {/*
          A flex row, not a 12-column grid.
          The portrait is capped at max-w-md, but its grid track was five of
          twelve columns — on a wide screen that is well over 700px, so the cap
          left ~280px of dead space inside the column and the quote appeared to
          float away to the right. Flex lets the picture take only the width it
          actually uses and the text take the rest, so the gap between them is
          the gap that is specified and nothing more.
        */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center mb-24 md:mb-32">
          <Reveal className="w-full max-w-md lg:flex-none lg:w-[clamp(320px,26vw,440px)]">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] mx-auto">
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
          <div className="flex-1 min-w-0">
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

        {/* ===== Executive directors =====
            The corporate-adviser feature that shared this row is gone: he is
            not on the company's current list, and the team section should show
            that list and nothing else. The directors now take the full width
            rather than seven columns of twelve. */}
        <Reveal className="mb-24 md:mb-32">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 max-w-4xl mx-auto">
            {directors.map((d) => (
              <div key={d.name} className="group">
                <div className="relative rounded-2xl overflow-hidden aspect-[5/6] mb-4">
                  <Portrait person={d} />
                </div>
                <p className="font-display text-base md:text-lg leading-snug">{d.name}</p>
                <p className="label text-cream/50 mt-2">{d.role}</p>
              </div>
            ))}
          </div>
        </Reveal>

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
                <Portrait person={m} />
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
