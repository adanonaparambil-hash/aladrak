"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { headOffice, introStatement, stats, vision, mission } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export default function Intro() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // word-by-word ink reveal, scrubbed to scroll
      gsap.to(".reveal-word", {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-statement]",
          start: "top 78%",
          end: "top 30%",
          scrub: true,
        },
      });

      // stat counters
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("en-US");
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    // pulled up over the pinned hero — the curtain
    <section
      id="about"
      ref={root}
      className="relative z-10 -mt-[100svh] bg-cream text-ink rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-40px_80px_rgba(0,0,0,0.45)]"
    >
      <div className="shell pt-24 md:pt-36 pb-28 md:pb-36">
        <p className="label text-brand mb-10 text-center">The Company</p>

        <h2
          data-statement
          /* Sized for THREE lines on a desktop measure.
             ~185 characters, and Marcellus averages 0.62em per character (measured,
             not assumed — a first pass at 0.46em gave four lines). Three lines
             therefore needs a measure of about 40x the font size, which is what
             the 2.3vw / 2200px pairing below gives at 1280, 1920 and 2560 alike. */
          className="font-display text-[7.5vw] md:text-[clamp(1.7rem,2.3vw,3.5rem)] leading-[1.2] text-center max-w-[min(2200px,100%)] mx-auto"
        >
          {introStatement.split(" ").map((w, i) => (
            <span key={i} className="reveal-word inline-block mr-[0.26em]">
              {w}
            </span>
          ))}
        </h2>

        {/*
          The company block — the Head Office section merged in here.
          It used to be a separate full-screen section further down the page
          carrying the same "One team. One vision." message, so the two were
          saying the same thing twice. One image of the company itself replaces
          the plant-room shot, which said nothing about who Al Adrak is.
        */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mt-20 md:mt-28">
          <figure className="lg:col-span-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/about/company.jpg"
              alt="The Al Adrak head office at Halban, seen from the front"
              loading="lazy"
              className="w-full rounded-2xl border border-ink/10 shadow-[0_24px_60px_rgba(16,39,26,0.14)]"
            />
            <figcaption className="label text-taupe mt-4">
              Head Office &middot; {headOffice.location}
            </figcaption>
          </figure>

          <div className="lg:col-span-5">
            <p className="label text-brand mb-5">Head Office &middot; Corporate Command</p>
            <h3 className="font-display text-[8vw] sm:text-4xl lg:text-[2.6vw] leading-[1.1] mb-6">
              {headOffice.title}
            </h3>
            <p className="text-ink/75 font-light leading-relaxed text-[clamp(0.9375rem,0.9vw,1.1875rem)]">
              {headOffice.body}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {[
                "Project Management",
                "Design & CAD",
                "Procurement & Logistics",
                "IT & Finance",
                "Facility Management",
              ].map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 border border-ink/15 rounded-full label label-xs text-ink/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8 mt-24 md:mt-32">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-5xl md:text-6xl text-forest">
                {"prefix" in s ? s.prefix : ""}
                <span data-count={s.value}>0</span>
                {s.suffix}
              </div>
              <div className="label text-taupe mt-4">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Vision / Mission — glass panels over a brand gradient */}
        <div className="relative mt-24 md:mt-32 [perspective:1200px]">
          <div className="pointer-events-none absolute -inset-8 bg-gradient-to-br from-brand/25 via-gold/15 to-forest/25 blur-2xl rounded-[3rem]" />
          <div className="relative grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_rgba(16,39,26,0.12)] p-10 md:p-12 transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(1deg)]">
              <p className="label text-brand mb-6">Vision</p>
              <p className="font-serifit text-2xl md:text-[26px] leading-snug text-ink/85">
                {vision}
              </p>
            </div>
            <div className="rounded-3xl bg-forest/90 backdrop-blur-xl border border-white/10 text-cream shadow-[0_20px_50px_rgba(16,39,26,0.3)] p-10 md:p-12 transform-gpu transition-transform duration-500 hover:[transform:rotateX(1.5deg)_rotateY(-1deg)]">
              <p className="label text-gold mb-6">Mission</p>
              <p className="font-serifit text-2xl md:text-[26px] leading-snug text-cream/90">
                {mission}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
