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

type NavLink = { href: string; label: string; note?: string };
type NavItem = NavLink | { label: string; children: NavLink[] };
const hasChildren = (i: NavItem): i is { label: string; children: NavLink[] } =>
  "children" in i;

export default function Header() {
  const pathname = usePathname();
  // usePathname() reports the route without the base path, so "/" is the home page
  const onHome = pathname === "/";
  const section = (id: string) => (onHome ? `#${id}` : asset(`/#${id}`));

  /**
   * Careers and HSE live under Resources rather than at the top level.
   *
   * They are the two standing reference pages — things a visitor comes looking
   * for deliberately, rather than steps in the story the home page tells. A
   * group keeps the top row to the narrative and leaves somewhere for the next
   * such page to go.
   */
  const links: NavItem[] = [
    ...SECTIONS.map((id) => ({
      href: section(id),
      label: id[0].toUpperCase() + id.slice(1),
    })),
    { href: asset("/news"), label: "News" },
    {
      label: "Resources",
      children: [
        { href: asset("/careers"), label: "Careers", note: "Openings and life at Adrak" },
        { href: asset("/hse"), label: "HSE", note: "Health, safety & environment" },
      ],
    },
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
          {links.map((l) =>
            hasChildren(l) ? (
              /* The group opens on hover AND on focus-within, so it is reachable
                 by keyboard; the wrapper carries no gap between trigger and
                 panel, or the pointer would cross dead space and close it. */
              <div key={l.label} className="relative group/nav">
                <button
                  type="button"
                  aria-haspopup="true"
                  className="label text-cream/70 group-hover/nav:text-gold group-focus-within/nav:text-gold transition-colors duration-300 flex items-center gap-1.5"
                >
                  {l.label}
                  <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden className="opacity-70">
                    <path d="M0.6 0.6 L4 4 L7.4 0.6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1
                             group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0
                             group-focus-within/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0
                             transition-all duration-300"
                >
                  <div className="w-64 rounded-2xl border border-cream/15 bg-ink/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-2">
                    {l.children.map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        className="block rounded-xl px-4 py-3 hover:bg-cream/[0.07] transition-colors duration-200"
                      >
                        <span className="label text-cream/90 block">{c.label}</span>
                        {/* Not .label: at 0.3em tracking and uppercase these
                            descriptions wrapped onto two lines and made the
                            panel ragged. Plain sentence case is narrower, and
                            reads better as a description than as a kicker. */}
                        {c.note && (
                          <span className="block mt-1 text-[12px] leading-snug text-cream/45 whitespace-nowrap">
                            {c.note}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="label text-cream/70 hover:text-gold transition-colors duration-300"
              >
                {l.label}
              </a>
            )
          )}
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
            // w-11 h-11 is the 44px minimum: p-2 around two 1px bars left this
            // 40x24, the smallest target on the page and the one that opens the
            // whole menu
            className="md:hidden relative z-50 w-11 h-11 flex flex-col items-center justify-center gap-1.5"
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
          {links.map((l) =>
            hasChildren(l) ? (
              /* No dropdown on a phone — a hover panel has nothing to hover.
                 The group becomes a labelled section with its pages listed
                 under it, which is one tap instead of two. */
              <div key={l.label} className="mt-2">
                <span className="label label-xs text-gold/70 block mb-1">{l.label}</span>
                {l.children.map((c) => (
                  <a
                    key={c.href}
                    href={c.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="font-display text-[7vw] min-[420px]:text-2xl leading-none py-2.5 text-cream/90 hover:text-gold transition-colors block"
                  >
                    {c.label}
                  </a>
                ))}
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                // py-2.5 is the touch target, not decoration: leading-none left
                // these 26px tall, well under the 44px minimum for a thumb
                className="font-display text-[7vw] min-[420px]:text-2xl leading-none py-2.5 text-cream/90 hover:text-gold transition-colors"
              >
                {l.label}
              </a>
            )
          )}
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
