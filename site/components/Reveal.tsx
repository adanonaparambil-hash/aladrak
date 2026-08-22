"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Fade-up reveal on scroll — wrap any block. `tilt` adds a 3D flip-up. */
export default function Reveal({
  children,
  delay = 0,
  y = 44,
  tilt = false,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  tilt?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        tilt
          ? { autoAlpha: 0, y: y + 30, rotationX: 14, transformPerspective: 900, transformOrigin: "center bottom" }
          : { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: tilt ? 1.3 : 1.1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
    return () => ctx.revert();
  }, [delay, y, tilt]);

  return (
    <div ref={ref} className={className} style={{ visibility: "hidden" }}>
      {children}
    </div>
  );
}
