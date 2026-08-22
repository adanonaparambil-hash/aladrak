"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/content";
import { ARRIVAL_ORIGIN, ARRIVAL_SCALE, motionOK } from "@/lib/intro";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned full-screen video hero. The wrapper is 200vh tall; the inner screen
 * is sticky, so the next section (pulled up with -mt-[100vh]) slides over it
 * like a rising curtain — the ojas-style scroll-layering effect.
 */
export default function Hero() {
  const screen = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // the page's own arrival — the title staggers up as the film starts
      const entrance = gsap.fromTo(
        "[data-hero-stagger]",
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.16,
          ease: "power3.out",
          delay: 0.25,
          paused: true,
        }
      );

      if (motionOK()) {
        entrance.play();
        // the film eases out of a slight push, so landing reads as a camera
        // settling rather than a layout appearing
        gsap.fromTo(
          screen.current,
          { scale: ARRIVAL_SCALE, transformOrigin: ARRIVAL_ORIGIN },
          {
            scale: 1,
            duration: 2.4,
            ease: "power2.out",
            onComplete: () =>
              gsap.set(screen.current, { clearProps: "transform,willChange" }),
          }
        );
      } else {
        // motion reduced: no move, but the content is all there immediately
        entrance.progress(1).pause();
      }
      // content drifts up + fades as the curtain rises
      gsap.to(content.current, {
        autoAlpha: 0,
        y: -120,
        ease: "none",
        scrollTrigger: {
          trigger: screen.current,
          start: "top top",
          end: "+=70%",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div id="top" className="relative h-[200svh] z-0">
      <div ref={screen} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Desktop film */}
        <video
          data-hero-video="web"
          src={asset("/videos/hero-web.mp4")}
          poster={asset("/images/hero-poster.jpg")}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover"
        />
        {/* Mobile (vertical re-frame) */}
        <video
          data-hero-video="mobile"
          src={asset("/videos/hero-mobile.mp4")}
          poster={asset("/images/hero-poster.jpg")}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="sm:hidden absolute inset-0 w-full h-full object-cover"
        />

        {/* Scrims for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink/80" />
        <div className="absolute inset-0 bg-ink/20" />

        {/* Content */}
        <div
          ref={content}
          data-tilt
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 will-change-transform"
        >
          <p data-hero-stagger className="label text-gold mb-6">
            {site.legalName}
          </p>
          <h1
            data-hero-stagger
            className="font-display text-cream text-[17vw] sm:text-[11vw] lg:text-[120px] leading-[0.95] tracking-wide drop-shadow-2xl"
          >
            Legacy of
            <br />
            Landmarks
          </h1>
          <p
            data-hero-stagger
            className="font-serifit italic text-cream/90 text-lg md:text-2xl max-w-xl mt-8 leading-relaxed"
          >
            {site.heroSub}
          </p>
          <div data-hero-stagger className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto px-4 sm:px-0">
            <a
              href="#projects"
              className="px-10 py-5 bg-gold text-ink rounded-full label font-bold text-center shadow-xl hover:shadow-[0_0_36px_rgba(201,155,69,0.45)] transition-shadow duration-500"
            >
              Explore Our Work
            </a>
            <a
              href="#contact"
              className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/30 text-cream rounded-full label font-bold text-center hover:bg-white/10 hover:border-gold hover:text-gold transition-all duration-500"
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          <span className="label text-cream/60">Scroll</span>
          <span className="block w-px h-12 bg-gradient-to-b from-cream/70 to-transparent" />
        </div>
      </div>
    </div>
  );
}
