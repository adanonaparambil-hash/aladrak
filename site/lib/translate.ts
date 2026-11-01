import dictionary from "./translations.ar.json";
import type { Locale } from "./i18n";
const copy: Record<string, string> = dictionary;

/** Display strings only: never pass URLs, IDs, user input or form values here. */
export function translateText(text: string, locale: Locale): string {
  if (locale !== "ar") return text;
  const key = text.replace(/\s+/g, " ").trim();
  let translated = copy[key];
  if (translated === undefined) {
    const intro = key.match(/^For over (\d+) years, Al Adrak has shaped/);
    const milestone = key.match(/^GEMS School Management and Adrak Developers partner.*? (\d+) years on,/);
    const validation = key.match(/^(\d+) fields need attention\.$/);
    if (intro) translated = `على مدى أكثر من ${intro[1]} عاماً، أسهمت الأدراك في تشكيل أفق السلطنة — شركة إنشاءات متكاملة مملوكة بالكامل لعُمانيين، تنفّذ معالم بنظام تسليم المفتاح وبإمكانات داخلية كاملة.`;
    else if (milestone) translated = `جيمس لإدارة المدارس وأدرك للتطوير تتعاونان لإنشاء مدرسة دولية في حي النسيم ببركاء، تفتتح في سبتمبر 2027 وتستوعب 1,600 طالب. وبعد ${milestone[1]} عاماً، نواصل بناء مستقبل عُمان.`;
    else if (validation) translated = `يرجى مراجعة ${validation[1]} حقول.`;
    else if (key.includes(" · ")) translated = key.split(" · ").map(part => translateText(part, locale)).join(" · ");
  }
  if (translated === undefined) {
    const gallery = key.match(/^View the (.+) gallery$/);
    const view = key.match(/^View (.+)$/);
    const detail = key.match(/^View (.+) details$/);
    const arrow = key.match(/^(Previous|Next) (.+)$/);
    if (detail) translated = `عرض تفاصيل ${translateText(detail[1], locale)}`;
    else if (gallery) translated = `عرض معرض ${translateText(gallery[1], locale)}`;
    else if (view) translated = `عرض ${translateText(view[1], locale)}`;
    else if (arrow) translated = `${arrow[1] === "Next" ? "التالي" : "السابق"}: ${translateText(arrow[2], locale)}`;
  }
  if (translated === undefined) return text;
  return (text.match(/^\s*/)?.[0] ?? "") + translated + (text.match(/\s*$/)?.[0] ?? "");
}

/** JSX may contain elements or numbers; keep those values and their keys intact. */
export function translateValue<T>(value: T, locale: Locale): T {
  return (typeof value === "string" ? translateText(value, locale) : value) as T;
}

// Knowledge entries combine complete source sentences and labels. Longest-first
// matching translates those fragments without changing their source identifiers.
const phrases = Object.keys(copy).filter(key => key.length > 2).sort((a, b) => b.length - a.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phrasePattern = new RegExp("(?<![\\p{L}\\p{N}])(?:" + phrases.map(escape).join("|") + ")(?![\\p{L}\\p{N}])", "gu");
export function translatePassage(text: string, locale: Locale): string {
  if (locale === "en") return text;
  return translateText(text, locale).replace(phrasePattern, match => copy[match]);
}
