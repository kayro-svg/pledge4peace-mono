"use client";

import { useTranslations } from "next-intl";
import { I18nStatus } from "@/components/i18n/i18n-status";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function I18nTestPage() {
  const t = useTranslations("Home");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Internationalization Test Page
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Language Switcher</h2>
        <div className="flex items-center gap-2 p-4 border rounded-md">
          <span>Change language:</span>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Translation Examples</h2>
        <div className="grid gap-4 p-4 border rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">Home.welcome:</div>
            <div>{t("welcome")}</div>

            <div className="font-medium">Home.howItWorks:</div>
            <div>{t("howItWorks")}</div>

            <div className="font-medium">Home.campaigns:</div>
            <div>{t("campaigns")}</div>
          </div>
        </div>
      </div>

      <I18nStatus />
    </div>
  );
}
