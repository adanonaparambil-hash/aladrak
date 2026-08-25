"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOUNDED, years } from "@/lib/anniversary";
import { motionOK } from "@/lib/intro";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger);

/**
 * Our History — the 40-years wheel timeline, ported from the anniversary
 * microsite. Every year row is pre-rotated 15° around a pivot at the wheel's
 * left-center; scroll rotates the wheel 0 → -270° so the row nearest 0° sits
 * horizontal as "active". The dotted spine is the right arc of three huge
 * concentric dotted rings riding on the same wheel. ScrollTrigger scrubs the
 * rotation and snaps to the nearest year after scrolling rests.
 */

const STEP = 15; // degrees per year

const MILESTONES = [
  { year: "1986", img: asset("/images/team/founder.jpg"), text: "Al Adrak is founded in Muscat, Oman, by Dr. Thomas Alexander—starting as a modest enterprise with a vision for nation-building and world-class construction." },
  { year: "1990", img: asset("/images/projects/villa-seeb.jpg"), text: "Early growth: from minor contracts and maintenance to broader civil and building works across the Sultanate." },
  { year: "1995", img: asset("/images/division-mechanical.jpg"), text: "Diversification into mechanical, electrical and infrastructural engineering—laying the foundation for full EPC capabilities." },
  { year: "2000", img: asset("/images/projects/rop.jpg"), text: "Recognized as an established Omani contractor with a growing portfolio of government and institutional projects." },
  { year: "2003", img: asset("/images/awards/cert-iso-9001.jpg"), text: "Commitment to quality and HSE: ISO 9001, and later ISO 14001 and OHSAS 18001, become part of the Adrak way of life." },
  { year: "2006", img: asset("/images/projects/mohe.jpg"), text: "Major landmark projects take shape—strengthening our reputation in commercial, government and infrastructure sectors." },
  { year: "2008", img: asset("/images/facilities/gallery-drone.jpg"), text: "Navigating the global financial crisis while deepening EPC and project management capabilities for the long term." },
  { year: "2010", img: asset("/images/projects/waljat.jpg"), text: "Delivery of flagship projects including institutional and commercial buildings that define Oman’s built environment." },
  { year: "2013", img: asset("/images/projects/kom4.jpg"), text: "Regional ambition: laying the groundwork for expansion across the Middle East and the Indian Subcontinent." },
  { year: "2015", img: asset("/images/blog/dr-thomas-alexander-receiving-the-achievement-aw.jpg"), text: "Dr. Thomas Alexander receives Omani citizenship in recognition of his contributions to nation-building and the construction industry." },
  { year: "2017", img: asset("/images/blog/adrak-developers-marks-first-key-handove.jpg"), text: "Group diversification: Adrak Developers, hospitality and real estate ventures extend the Al Adrak footprint." },
  { year: "2018", img: asset("/images/blog/al-adrak-s-dubai-journey-eh3-groundbreaking-cere.jpg"), text: "Al Adrak Contracting Co LLC established in Dubai—UAE presence strengthens our regional delivery." },
  { year: "2019", img: asset("/images/awards/award-forbes.jpg"), text: "Forbes recognition: among Oman’s top unlisted companies and Top 100 in the GCC. American British Business Award, European Business Award." },
  { year: "2020", img: asset("/images/projects/mazoon-dairy.jpg"), text: "Landmark projects: Mazoon Dairy at Buraimi, Marriott Aloft Ghala, Cheltenham School Seeb, and continued delivery through challenging times." },
  { year: "2022", img: asset("/images/head-office.jpg"), text: "Al Adrak Contracting Co LLC in KSA and Adrak India expand the group—Oman, UAE, KSA and India now under one vision." },
  { year: "2023", img: asset("/images/blog/business-leader-of-the-year-2023-dr-aadil-thoma.jpg"), text: "Dr. Thomas Alexander named Iconic Business Leader of the Year. Workforce of 6,000+; order book exceeding $1 billion." },
  { year: "2024", img: asset("/images/projects/adlife.jpg"), text: "500,000 sqm construction capacity. Adrak Hotels, Adlife Hospital, Trinity College and support facilities underscore integrated capabilities." },
  { year: "2025", img: asset("/images/projects/central-bank.jpg"), text: "Central Bank of Oman, Muscat Insurance HQ, Hai Al Naseem Barka and more—a legacy of landmarks across the Sultanate." },
  { year: "2026", img: asset("/images/projects/dubai-ellington.jpg"), text: `We celebrate ${years()} years of Al Adrak—award-winning, internationally recognized, and committed to the next chapter of building Oman’s future.` },
];

const RINGS = [
  { src: asset("/images/timeline/circle-dots.svg"), scale: 0.53, opacity: 0.5 },
  { src: asset("/images/timeline/circle-dots-2.svg"), scale: 0.545, opacity: 0.75 },
  { src: asset("/images/timeline/circle-dots-3.svg"), scale: 0.57, opacity: 1 },
];

export default function HistoryTimeline() {
  const section = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const tunnel = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  /** the wheel is a wide-screen device; phones and reduced motion get the list */
  const [wheel, setWheel] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWheel(mq.matches && motionOK());
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * Warm every milestone photograph before the wheel can ask for it.
   *
   * The plate's <img>s are loading="lazy" and stacked at opacity 0, so the
   * browser fetched them only as the section arrived — and a quick scrub
   * through the years could land on a milestone whose photograph was still
   * downloading, which showed as the plate flashing empty or half-painted
   * mid-scroll. One warm pass fills the cache so every swap is instant. It
   * waits for the page's own load event plus a beat, so it never competes with
   * the hero film for bandwidth.
   */
  useEffect(() => {
    let timer = 0;
    const warm = () => {
      for (const m of MILESTONES) {
        const im = new Image();
        im.src = m.img;
      }
    };
    const after = () => {
      timer = window.setTimeout(warm, 1500);
    };
    if (document.readyState === "complete") after();
    else window.addEventListener("load", after, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", after);
    };
  }, []);

  /* ---- 3D particle tunnel behind the wheel (from the 40-years microsite) ---- */
  useEffect(() => {
    const canvas = tunnel.current;
    const root = section.current;
    if (!canvas || !root) return;
    if (!motionOK()) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    let width = 0, height = 0;
    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const narrow = window.innerWidth < 1000;
    const RING_N = narrow ? 11 : 18;
    const PER_RING = 40;
    const SPACING = 500;
    const DEPTH = narrow ? 1100 : 1700;
    const FLOATS = narrow ? 120 : 250;

    const rings = Array.from({ length: RING_N }, (_, i) => ({
      z: i * SPACING,
      dir: i % 2 === 0 ? 1 : -1,
      off: 0,
      dots: Array.from({ length: PER_RING }, (_, j) => (j / PER_RING) * Math.PI * 2),
    }));
    const floats = Array.from({ length: FLOATS }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * DEPTH,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      ox: Math.random() * Math.PI * 2,
      oy: Math.random() * Math.PI * 2,
      amp: Math.random() * 20 + 8,
      freq: Math.random() * 0.03 + 0.015,
    }));

    let inView = false;
    const io = new IntersectionObserver(([e]) => {
      const was = inView;
      inView = e.isIntersecting;
      if (inView && !was) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
    io.observe(root);

    let current = 0, lastScroll = 0, raf = 0;
    let last = performance.now();
    const start = performance.now();

    const loop = () => {
      if (!inView) return;
      const now = performance.now();
      const dt = (now - last) / 1000;
      const elapsed = (now - start) / 1000;
      last = now;

      const target = (window.scrollY - root.offsetTop) * 0.5;
      current += (target - current) * 0.05;
      const speed = dt > 0 ? (current - lastScroll) / dt : 0;
      lastScroll = current;

      ctx2d.clearRect(0, 0, width, height);
      ctx2d.save();
      ctx2d.translate(width / 2, height / 2);

      for (const fp of floats) {
        const mx = Math.sin(elapsed * fp.freq * 6 + fp.ox) * fp.amp + Math.sin(elapsed * 3 + fp.oy) * 2;
        const my = Math.cos(elapsed * fp.freq * 6 + fp.oy) * fp.amp + Math.cos(elapsed * 1.8 + fp.ox) * 2;
        let z = fp.z - current * fp.speed;
        while (z < 0) z += DEPTH;
        while (z > DEPTH) z -= DEPTH;
        if (z <= 0 || z >= DEPTH) continue;
        const p = 500 / z;
        ctx2d.beginPath();
        ctx2d.arc((fp.x + mx) * p, (fp.y + my) * p, fp.size * p, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(245,242,234,${1 - z / DEPTH})`;
        ctx2d.fill();
      }

      for (const ring of rings) {
        const z = ring.z - (((current % (RING_N * SPACING)) + RING_N * SPACING) % (RING_N * SPACING));
        const zz = z < -SPACING ? z + RING_N * SPACING : z;
        if (zz <= 0 || zz >= DEPTH) continue;
        const p = 500 / zz;
        const spin = ring.dir * (0.2 + Math.min(Math.abs(speed) * 0.001, 1));
        ring.off = (ring.off + spin * dt) % (Math.PI * 2);
        const alpha = 1 - zz / DEPTH;
        ctx2d.fillStyle = `rgba(245,242,234,${alpha})`;
        for (const base of ring.dots) {
          const a = base + ring.off;
          ctx2d.beginPath();
          ctx2d.arc(Math.cos(a) * 250 * p, Math.sin(a) * 250 * p, 3 * p, 0, Math.PI * 2);
          ctx2d.fill();
        }
      }

      ctx2d.restore();
      raf = requestAnimationFrame(loop);
    };

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // must re-run when `wheel` flips true and the canvas finally mounts
  }, [wheel]);

  useEffect(() => {
    // the wheel only exists on wide screens with motion allowed; without this
    // guard the section still pinned on a phone and showed a near-empty screen
    if (!wheel) return;
    const root = section.current;
    const circle = wheelRef.current;
    if (!root || !circle) return;

    let snapTimer: number | undefined;
    const ctx = gsap.context(() => {
      const total = -STEP * (MILESTONES.length - 1);
      const rot = { v: 0 };
      const apply = () => {
        circle.style.transform = `rotate(${rot.v}deg)`;
      };
      let snapTween: gsap.core.Tween | null = null;

      gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${(MILESTONES.length - 1) * 30}%`,
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          onUpdate: (st) => {
            // a fresh scroll takes over from any wheel snap in flight
            if (snapTween) {
              snapTween.kill();
              snapTween = null;
            }
            const i = Math.min(
              MILESTONES.length - 1,
              Math.round(st.progress * (MILESTONES.length - 1))
            );
            setActive((prev) => (prev === i ? prev : i));
            // after the scroll rests, ease the wheel onto the nearest year
            // (rotation only — never the page, which would fight Lenis)
            window.clearTimeout(snapTimer);
            snapTimer = window.setTimeout(() => {
              const idx = Math.min(
                MILESTONES.length - 1,
                Math.max(0, Math.round(-rot.v / STEP))
              );
              const target = -idx * STEP;
              if (Math.abs(target - rot.v) > 0.05) {
                snapTween = gsap.to(rot, {
                  v: target,
                  duration: 0.7,
                  ease: "power3.out",
                  onUpdate: apply,
                });
              }
              setActive(idx);
            }, 550);
          },
        },
      }).to(rot, {
        v: total,
        ease: "none",
        onUpdate: apply,
      });

      // entrance — the wheel scales in as the section arrives
      gsap.fromTo(
        root.querySelector("[data-stage]"),
        { autoAlpha: 0, scale: 0.65 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        }
      );
    }, root);

    return () => {
      window.clearTimeout(snapTimer);
      ctx.revert();
    };
  }, [wheel]);

  return (
    <section ref={section} id="history" className="relative bg-ink text-cream overflow-hidden">
      {wheel && (
      <div className="relative h-[100dvh]" data-stage>
        {/* gold radial glow behind the wheel */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse farthest-corner at center, rgba(170,151,93,0.45) 0%, rgba(10,15,12,0) 80%)",
          }}
        />
        {/* 3D particle tunnel */}
        <canvas
          ref={tunnel}
          aria-hidden
          className="pointer-events-none absolute inset-0 w-full h-full opacity-40"
        />

        {/* ===== left column — heading, intro, crossfading image ===== */}
        <div className="absolute z-10 left-6 right-6 top-[7vh] lg:top-auto lg:bottom-[54vh] lg:left-[11%] lg:right-auto lg:w-[24vw]">
          <p className="label text-gold mb-3">Est. 1986</p>
          <h2 className="font-display text-4xl lg:text-[3vw] leading-none mb-4">Our History</h2>
          <p className="text-cream/70 font-light text-sm lg:text-[1.05vw] leading-relaxed max-w-md">
            {years()}+ years of building for what’s next. From a modest enterprise in
            Muscat to a leading EPC firm—civil, mechanical, electrical and
            infrastructural engineering across Oman and the region.
          </p>
        </div>
        {/* The plate was a flat 17vw — about 435px on a 2560 display, which read
            as a thumbnail. Sized off BOTH axes now (`min` of a width and a
            height term) so it grows on wide screens without ever running past
            the bottom of the pinned stage on a short one. Lifted to 47vh to
            make the room for it. */}
        <div className="hidden lg:block absolute z-10 left-[11%] top-[47vh] w-[min(30vw,52vh)] aspect-[5/4]">
          {MILESTONES.map((m, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={m.year}
              src={m.img}
              alt={`Al Adrak in ${m.year}`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-top rounded-xl border border-cream/10 transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* ===== the wheel ===== */}
        <div className="absolute top-0 bottom-0 left-[-40%] w-[130vw] translate-y-[6%] lg:translate-y-0 lg:left-[11vw] lg:w-[70vw] flex items-center">
          <div
            ref={wheelRef}
            className="relative grid w-full will-change-transform select-none [place-items:center_stretch]"
            style={{ transformOrigin: "0% 50%" }}
          >
            {/* dotted rings — their right arc is the visible spine */}
            {RINGS.map((r) => (
              <div
                key={r.src}
                aria-hidden
                className="absolute right-0 top-1/2 w-[210vw] h-[210vw] lg:w-[140vw] lg:h-[140vw]"
                style={{
                  background: `url(${r.src}) no-repeat center / 100% 100%`,
                  transform: `translateY(-50%) scale(${r.scale})`,
                  opacity: r.opacity,
                }}
              />
            ))}

            {MILESTONES.map((m, i) => {
              const d = Math.abs(i - active);
              const op = d === 0 ? "opacity-100" : d === 1 ? "opacity-20" : d === 2 ? "opacity-[0.05]" : "opacity-0";
              return (
                <div
                  key={m.year}
                  className={`relative [grid-area:1/1] pl-[60%] transition-opacity duration-500 ${op}`}
                  style={{ transform: `rotate(${i * STEP}deg)`, transformOrigin: "0% 50%" }}
                >
                  <div
                    className={`absolute right-1/2 top-1/2 font-display leading-none text-[7vw] lg:text-[2.4vw] text-right transition-transform duration-500 ${
                      i === active ? "translate-x-0 -translate-y-1/2" : "-translate-x-[20%] -translate-y-1/2"
                    }`}
                  >
                    {m.year}
                  </div>
                  {/* The story belongs to the axis alone. Off-axis rows used to
                      show their whole paragraph rotated with the wheel at 20%
                      and 5% opacity — a page of diagonal ghost text that read
                      as a rendering glitch, not as depth. The tilted YEAR gives
                      the wheel its depth; the paragraph appears only upright. */}
                  <div
                    className={`relative font-light text-[3.07vw] lg:text-[1.25vw] leading-[1.35] pr-[4vw] transition-opacity duration-500 ${
                      i === active ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 right-[103%] w-[2vw] h-[2vw] lg:w-[1vw] lg:h-[1vw] rounded-full bg-brand transition-opacity duration-500 ${
                        i === active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      )}

      {/*
        The list — phones and reduced motion.
        The wheel is a wide-screen device: at 390px its geometry put all but one
        or two years off-frame and left a full viewport of empty ground, with no
        story text visible at all. This gives the same 19 milestones as a plain
        vertical read.
      */}
      {!wheel && (
        <div className="px-6 py-20">
          <p className="label text-gold mb-3">Est. {FOUNDED}</p>
          <h2 className="font-display text-4xl mb-4">Our History</h2>
          <p className="text-cream/70 font-light leading-relaxed mb-14">
            {years()}+ years of building for what&rsquo;s next. From a modest
            enterprise in Muscat to a leading EPC firm across Oman and the region.
          </p>
          <ol className="relative border-l border-cream/15 pl-6 space-y-12">
            {MILESTONES.map((m) => (
              <li key={m.year} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[1.6rem] top-2 w-2.5 h-2.5 rounded-full bg-gold"
                />
                <p className="font-display text-3xl text-cream mb-3">{m.year}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.img}
                  alt={`Al Adrak in ${m.year}`}
                  loading="lazy"
                  className="w-full aspect-[5/4] object-cover object-top rounded-xl border border-cream/10 mb-4"
                />
                <p className="text-cream/80 font-light leading-relaxed text-[clamp(0.9375rem,0.85vw,1.25rem)]">
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
