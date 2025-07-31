// apps/web/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve promise and ensure we have a string
  const requested = (await requestLocale) ?? routing.defaultLocale;

  // Validate against supported locales
  const locale = routing.locales.includes(
    requested as (typeof routing.locales)[number]
  )
    ? (requested as (typeof routing.locales)[number])
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
