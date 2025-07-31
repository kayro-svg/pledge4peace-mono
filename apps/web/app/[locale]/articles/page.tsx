import { Suspense } from "react";
import ArticlesContent from "./articles-content";
import { getArticles } from "@/lib/sanity/queries";
import HeroBanner from "@/components/about/hero-banner";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen">
      <HeroBanner
        heroSection={{
          heroHeading: "Articles & Updates",
          heroSubheading:
            "Stay informed with our latest articles, insights, and updates on global peace initiatives and community actions.",
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
