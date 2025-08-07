import { Suspense } from "react";
import ArticlesContent from "./articles-content";
import { getArticles } from "@/lib/sanity/queries";
import HeroBanner from "@/components/about/hero-banner";
import { getTranslations } from "next-intl/server";

export async function generateStaticParams() {
  const locales = ["en", "es"]; // ajusta según i18n
  return locales.map((locale) => ({ locale }));
}

export default async function ArticlesPage({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const t = await getTranslations("Articles_Page");
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  const articles = await getArticles(undefined, locale as "en" | "es");

  return (
    <main className="min-h-screen">
      <HeroBanner
        heroSection={{
          heroHeading: t("articles_label"),
          heroSubheading: t("articles_description"),
          heroBgImage: undefined,
        }}
        noButton
        fullWidth
      />

      <Suspense fallback={<div>Loading...</div>}>
        <ArticlesContent initialArticles={articles} />
      </Suspense>
    </main>
  );
}
