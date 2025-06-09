import { Suspense } from "react";
import ArticlesContent from "@/app/articles/articles-content";
import { getArticles } from "@/lib/sanity/queries";
import HeroBanner from "@/components/about/hero-banner";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {/* <section className="bg-[#2F4858] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Articles & Updates
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Stay informed with our latest articles, insights, and updates on
            global peace initiatives and community actions.
          </p>
        </div>
      </section> */}
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
