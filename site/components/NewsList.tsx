"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import newsData from "@/lib/news-data.json";

gsap.registerPlugin(ScrollTrigger);

type Post = {
  slug: string;
  date: string;
  title: string;
  img: string | null;
  body: string[];
};

const posts = newsData as Post[];

/** News grid + GSAP article reader overlay. */
export default function NewsList() {
  const [post, setPost] = useState<Post | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-ncard]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 70, rotationX: 12, transformPerspective: 900, transformOrigin: "center bottom" },
          {
            autoAlpha: 1, y: 0, rotationX: 0, duration: 1,
            delay: (i % 3) * 0.1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!post) return;
    document.documentElement.style.overflow = "hidden";
    const t = gsap.timeline();
    t.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
    t.fromTo(
      panel.current,
      { autoAlpha: 0, y: 90, scale: 0.95 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
      "-=0.2"
    );
    t.fromTo(
      "[data-news-stagger]",
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" },
      "-=0.4"
    );
    return () => { t.kill(); };
  }, [post]);

  const close = useCallback(() => {
    const t = gsap.timeline({
      onComplete: () => {
        setPost(null);
        document.documentElement.style.overflow = "";
      },
    });
    t.to(panel.current, { autoAlpha: 0, y: 60, duration: 0.3, ease: "power2.in" });
    t.to(backdrop.current, { autoAlpha: 0, duration: 0.25 }, "-=0.1");
  }, []);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [post, close]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1200px]">
        {posts.map((p) => (
          <article
            key={p.slug}
            data-ncard
            onClick={() => setPost(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setPost(p)}
            className="group cursor-pointer rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl border border-ink/10 hover:border-gold/60 hover:shadow-[0_24px_60px_rgba(16,39,26,0.14)] transform-gpu transition-all duration-500 hover:-translate-y-1.5"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-parchment">
              {p.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-forest">
                  <span className="font-display text-4xl text-gold/60">A</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="label text-brand">{p.date}</p>
              <h3 className="font-display text-xl leading-snug mt-3 text-ink">
                {p.title}
              </h3>
              <p className="text-taupe text-sm font-light leading-relaxed mt-3 line-clamp-2">
                {p.body[0]}
              </p>
              <span className="label label-xs text-gold mt-4 inline-block">
                Read Story →
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Reader overlay */}
      {post && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div
            ref={backdrop}
            onClick={close}
            className="absolute inset-0 bg-ink/85 backdrop-blur-xl"
          />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-cream text-ink shadow-[0_60px_140px_rgba(0,0,0,0.7)]"
          >
            {post.img && (
              <div className="relative aspect-[16/8] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.img}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 md:p-12">
              <p data-news-stagger className="label text-brand">
                {post.date}
              </p>
              <h2
                data-news-stagger
                className="font-display text-3xl md:text-4xl leading-tight mt-4"
              >
                {post.title}
              </h2>
              <div data-news-stagger className="mt-8 space-y-5">
                {post.body.map((para, i) => (
                  <p key={i} className="font-light text-ink/80 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ink/60 backdrop-blur-md text-cream flex items-center justify-center hover:bg-gold hover:text-ink hover:rotate-90 transition-all duration-400"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
