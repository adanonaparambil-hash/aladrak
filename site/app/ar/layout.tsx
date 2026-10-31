import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n-client";

/**
 * Everything under /ar renders in Arabic, right to left.
 *
 * The <html> element belongs to the root layout and a nested layout cannot
 * change it, so the direction is set two ways. A wrapper carries dir="rtl",
 * which is what Tailwind's rtl: variants and every CSS logical property key
 * off, and a small inline script corrects lang and dir on <html> itself before
 * first paint — which is what a screen reader and a search engine read. The
 * script is three lines of ES5 so it cannot fail on an old browser; if it
 * somehow does, the wrapper still lays the page out correctly.
 *
 * The display faces used for English — Marcellus and Cormorant — carry no
 * Arabic glyphs at all, so Arabic set in them would silently fall back to
 * whatever the browser had. IBM Plex Sans Arabic is loaded for this subtree
 * instead: it is designed alongside the Latin Plex, it has the weights this
 * site uses, and it reads cleanly at both display and body sizes.
 */
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.lang='ar';document.documentElement.dir='rtl';",
        }}
      />
      <div dir="rtl" lang="ar" className={`${arabic.variable} font-arabic`}>
        <LocaleProvider locale="ar">{children}</LocaleProvider>
      </div>
    </>
  );
}
