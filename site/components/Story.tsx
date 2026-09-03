"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import { asset } from "@/lib/asset";

import { yearsWord } from "@/lib/anniversary";

/** Our Story — Al Adrak's own corporate film, click-to-play. */
export default function Story() {
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const v = vid.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  };

  return (
    <section className="relative z-20 bg-pine text-cream overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[30vh] bg-brand/15 blur-[140px] rounded-full" />
      {/* max-w-6xl put the film at ~1100px on a wide screen, which read as a
          thumbnail against sections that run the full shell. 88rem gives it
          ~1360px — about the source's own 1280 and a whisker over, so it fills
          the room without visibly softening. */}
      <div className="relative mx-auto max-w-[88rem] px-6 py-24 md:py-32">
        <Reveal className="text-center mb-12 md:mb-16">
          <p className="label text-gold mb-4">Our Story</p>
          <h2 className="font-display text-4xl md:text-6xl">
            {yearsWord()} years, two minutes
          </h2>
          <p className="font-serifit italic text-xl md:text-2xl text-cream/70 mt-5">
            The official Al Adrak corporate film
          </p>
        </Reveal>

        <Reveal tilt>
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 shadow-[0_40px_100px_rgba(0,0,0,0.55)] aspect-video">
            <video
              ref={vid}
              src={asset("/videos/story.mp4")}
              poster={asset("/images/story-poster.jpg")}
              controls={playing}
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <button
                onClick={start}
                aria-label="Play the Al Adrak corporate film"
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-ink/40 hover:bg-ink/25 transition-colors duration-500 cursor-pointer"
              >
                <span className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/40 shadow-[0_0_40px_rgba(201,155,69,0.35)] transition-transform duration-500 hover:scale-110">
                  <span className="absolute inset-0 rounded-full border border-gold/50 animate-ping [animation-duration:2.2s]" />
                  <svg width="26" height="30" viewBox="0 0 26 30" className="ml-1.5">
                    <path d="M0 0 L26 15 L0 30 Z" fill="var(--color-gold)" />
                  </svg>
                </span>
                <span className="label text-cream/90">Watch the film</span>
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
