import * as en from "./content";
import { ar } from "./content.ar";

/**
 * Two languages, one set of components.
 *
 * Split in two on purpose: this file is server-safe and holds the dictionaries
 * and the lookup, so page bodies (server components) can resolve their copy at
 * build time. The provider and hooks the client components use live next door
 * in i18n-client.tsx, which is the only part that has to ship to the browser.
 *
 * The Arabic dictionary is a PARTIAL overlay rather than a second full copy.
 * Anything not yet translated falls through to the English, so a half-finished
 * translation shows English in the gaps rather than blanks — and the two files
 * cannot drift apart silently as the English copy changes.
 */
export type Locale = "en" | "ar";

export const LOCALES: { code: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

type Dict = typeof en;

/** Merge the overlay onto the English, one level at a time. */
const merge = (base: unknown, over: unknown): unknown => {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    // arrays match by position; a shorter overlay leaves the rest English
    return base.map((item, i) => merge(item, (over as unknown[])[i]));
  }
  if (typeof base === "object" && base !== null && typeof over === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(over as Record<string, unknown>)) {
      out[k] = merge((base as Record<string, unknown>)[k], (over as Record<string, unknown>)[k]);
    }
    return out;
  }
  return over;
};

/* the dictionaries are module constants, so each locale is merged once */
const cache: Partial<Record<Locale, Dict>> = { en: en as Dict };

export function getContent(locale: Locale): Dict {
  if (!cache[locale]) cache[locale] = merge(en, ar) as Dict;
  return cache[locale]!;
}

/** UI chrome that is not site copy — the switch itself, the menu, the nav. */
export const UI = {
  en: {
    switchTo: "العربية",
    switchLabel: "اقرأ الموقع بالعربية",
    menu: "Menu",
    close: "Close",
    nav: {
      about: "About",
      expertise: "Expertise",
      projects: "Projects",
      facilities: "Facilities",
      team: "Team",
      news: "News",
      resources: "Resources",
      careers: "Careers",
      careersNote: "Openings and life at Adrak",
      hse: "HSE",
      hseNote: "Health, safety & environment",
      contact: "Contact",
      enquire: "Enquire",
    },
  },
  ar: {
    switchTo: "English",
    switchLabel: "Read the site in English",
    menu: "القائمة",
    close: "إغلاق",
    nav: {
      about: "عن الشركة",
      expertise: "خبراتنا",
      projects: "المشاريع",
      facilities: "المنشآت",
      team: "الفريق",
      news: "الأخبار",
      resources: "مصادر",
      careers: "الوظائف",
      careersNote: "الشواغر والعمل في الأدرك",
      hse: "الصحة والسلامة",
      hseNote: "الصحة والسلامة والبيئة",
      contact: "اتصل بنا",
      enquire: "استفسار",
    },
  },
} as const;

/** Prefix a site path with the locale. English stays at the root. */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return clean;
  return clean === "/" ? "/ar/" : `/ar${clean}`;
}

/**
 * Which pages exist in Arabic.
 *
 * The header is global, so the language switch renders on every page — but the
 * Arabic side is being built one route at a time, and a switch that points at a
 * route which has not been written yet is a 404 with the site's own branding on
 * it. This list is the gate: the switch only appears where there is something
 * on the other side. Add a path here in the same commit that adds its /ar page,
 * never before.
 */
export const AR_ROUTES = new Set(["/hse/"]);

/**
 * Is the Arabic side ready to be offered to visitors?
 *
 * The translation in content.ar.ts is a draft and has not been read by a native
 * speaker yet. The /ar pages are built and reachable, so a reviewer can be sent
 * straight to them, but until that review comes back the switch stays dark and
 * no visitor is handed unchecked Arabic. Flip this to true in the same commit
 * that records the sign-off — it is the only thing standing between the draft
 * translation and the public.
 */
export const AR_PUBLIC = false;

/** Does this path have an Arabic counterpart built yet? */
export function hasArabic(pathname: string) {
  const en = pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
  const withSlash = en.endsWith("/") ? en : `${en}/`;
  return AR_ROUTES.has(withSlash);
}

/**
 * Should the header offer the language switch on this page?
 *
 * The two directions are not symmetrical. Going into Arabic is an offer the
 * site makes, and it is withheld until the translation has been reviewed and
 * the page actually exists in Arabic. Coming back out is an escape hatch: a
 * reader who has landed on an Arabic page — a reviewer following a link, or
 * anyone who finds one another way — must always be able to get back to
 * English, so the Arabic side shows the switch unconditionally. Every Arabic
 * route is built from an English one, so the way back is never missing.
 */
export function showSwitch(locale: Locale, pathname: string) {
  return locale === "ar" || (AR_PUBLIC && hasArabic(pathname));
}
