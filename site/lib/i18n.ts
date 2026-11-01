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
      careersNote: "الشواغر والعمل في الأدراك",
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

/** All public routes have matching Arabic pages. */
export const AR_ROUTES = new Set(["/", "/news/", "/careers/", "/hse/"]);
export function hasArabic(pathname: string) {
 const en = pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
 return AR_ROUTES.has(en.endsWith("/") ? en : en + "/");
}
export function showSwitch(locale: Locale, pathname: string) { return locale === "ar" || hasArabic(pathname); }
