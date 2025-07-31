/**
 * Helper functions for handling localized content from Sanity
 */

type LocaleString = {
  en: string;
  es: string;
};

type LocaleText = {
  en: string;
  es: string;
};

type LocaleBlockContent = {
  en: any;
  es: any;
};

/**
 * Gets the localized string value based on current locale
 */
export function getLocaleString(
  localeObj: LocaleString | undefined | null,
  locale: string = "en"
): string {
  if (!localeObj) return "";

  // Default to English if the requested locale doesn't exist
  return localeObj[locale as keyof LocaleString] || localeObj.en || "";
}

/**
 * Gets the localized text value based on current locale
 */
export function getLocaleText(
  localeObj: LocaleText | undefined | null,
  locale: string = "en"
): string {
  if (!localeObj) return "";

  // Default to English if the requested locale doesn't exist
  return localeObj[locale as keyof LocaleText] || localeObj.en || "";
}

/**
 * Gets the localized block content based on current locale
 */
export function getLocaleBlockContent(
  localeObj: LocaleBlockContent | undefined | null,
  locale: string = "en"
): any {
  if (!localeObj) return null;

  // Default to English if the requested locale doesn't exist
  return localeObj[locale as keyof LocaleBlockContent] || localeObj.en || null;
}

/**
 * Gets the localized value from any locale object
 */
export function getLocaleValue<T extends Record<string, any>>(
  localeObj: T | undefined | null,
  locale: string = "en"
): any {
  if (!localeObj) return null;

  // Default to English if the requested locale doesn't exist
  return localeObj[locale as keyof T] || localeObj.en || null;
}
