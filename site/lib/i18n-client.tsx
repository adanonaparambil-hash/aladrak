"use client";

import { createContext, useContext } from "react";
import { getContent, UI, dirOf, type Locale } from "./i18n";

/**
 * The client half of the two-language setup.
 *
 * Eighteen of the twenty-four components that read the site's copy are client
 * components, so they ask the context which language they are in rather than
 * being handed it through eighteen layers of props. The provider is set once
 * per language route; the default is English, which is what the root layout
 * serves.
 */
const LocaleCtx = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>;
}

export const useLocale = () => useContext(LocaleCtx);
export const useDir = () => dirOf(useLocale());
export const useContentFor = () => getContent(useLocale());
export const useUI = () => UI[useLocale()];
