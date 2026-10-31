"use client";
import { useCallback } from "react";
import { useLocale } from "./i18n-client";
import { translateValue } from "./translate";

export function useText() {
  const locale = useLocale();
  return useCallback(<T,>(value: T): T => translateValue(value, locale), [locale]);
}
