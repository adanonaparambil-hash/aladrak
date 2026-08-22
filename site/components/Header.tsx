"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";
import { asset } from "@/lib/asset";

/**
 * The sections all live on the home page, so these are anchors, not routes.
 *
 * On the home page itself they are emitted as bare "#about" — a fragment with no
 * path at all. That is deliberately immune to where the site is mounted: it works
 * at the domain root, under /aladrak/, behind a custom domain, and in a page a
 * browser cached before any of that changed. An absolute "/#about" has to be
 * rewritten for the deploy's base path, and if that rewrite is ever missed the
 * link silently leaves the site — which is exactly what shipped.
 *
 * From another page there is no such section to jump to, so those links do need
 * a path back to the home page, and that one goes through asset().
 */
const SECTIONS = ["about", "expertise", "projects", "facilities", "team"] as const;

export default function Header() {
  const pathname = usePathname();
  // usePathname() reports the route without the base path, so "/" is the home page
  const onHome = pathname === "/";
  const section = (id: string) => (onHome ? `#${id}` : asset(`/#${id}`));

  const links = [
    ...SECTIONS.map((id) => ({
      href: section(id),
      label: id[0].toUpperCase() + id.slice(1),
    })),
    { href: asset("/news"), label: "News" },
    { href: asset("/careers"), label: "Careers" },
    { href: section("contact"), label: "Contact" },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* the panel covers the page, so stop the page scrolling behind it */
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2.5 bg-ink/35 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="shell flex items-center justify-between">
        {/* Logo — true brand colors, transparent, soft light glow for legibility */}
        <a href={section("top")} className="relative z-50 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/logo.png")}
            alt="Al Adrak"
            className={`w-auto transition-all duration-500 ${
              scrolled ? "h-8 sm:h-9 md:h-10" : "h-10 sm:h-12 md:h-14"
            } drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]`}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="label text-cream/70 hover:text-gold transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 label text-ink bg-gold rounded-full hover:bg-cream transition-colors duration-300"
          >
            Enquire
          </a>
          {/* Mobile burger */}
          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="md:hidden relative z-50 flex flex-col gap-1.5 p-2"
          >
            <span
              className={`block h-px w-6 bg-cream transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-cream transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/*
        Mobile menu — a full-screen panel, not a max-height accordion.
        The accordion capped at max-h-96 (384px) while eight items need ~448px,
        so Careers and Contact were clipped off, and `overflow-hidden` meant they
        could not be scrolled to either. The hero also showed through beneath it.
        A fixed panel cannot clip, scrolls if a short phone needs it, and hides
        the page behind it.
      */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-ink/[0.97] backdrop-blur-xl transition-opacity duration-400 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <nav className="h-full overflow-y-auto overscroll-contain px-7 pt-24 pb-10 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="font-display text-[7vw] min-[420px]:text-2xl leading-none text-cream/90 hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${site.email}`}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="mt-3 self-start px-7 py-3 label text-ink bg-gold rounded-full"
          >
            Enquire
          </a>
        </nav>
      </div>
    </header>
  );
}
