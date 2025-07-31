import { useLocale } from "next-intl";
import {
  getLocaleString,
  getLocaleText,
  getLocaleBlockContent,
  getLocaleValue,
} from "@/lib/sanity/locale-helpers";

/**
 * Hook for handling localized content from Sanity
 * Provides functions to get content in the current locale
 */
export function useLocaleContent() {
  const locale = useLocale();

  return {
    locale,
    getString: (obj: any) => getLocaleString(obj, locale),
    getText: (obj: any) => getLocaleText(obj, locale),
    getBlockContent: (obj: any) => getLocaleBlockContent(obj, locale),
    getValue: (obj: any) => getLocaleValue(obj, locale),
  };
}
