"use client";

import { useState, useEffect } from "react";
import { SanityArticle } from "@/lib/types";
import ArticleCard from "@/components/ui/article-card";
import ArticlesFilters from "@/components/articles/articles-filters";
import NoArticlesFound from "@/components/articles/no-articles-found";

interface ArticlesContentProps {
  initialArticles: SanityArticle[];
}

export default function ArticlesContent({
  initialArticles,
}: ArticlesContentProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    let filteredArticles = [...initialArticles];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filteredArticles = filteredArticles.filter((article) =>
        article.categories?.some((cat) => cat.title === selectedCategory)
      );
    }

    // Apply sorting
    const sortArticles = (articles: SanityArticle[]) => {
      return articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();

        // Handle date-based sorting
        if (
          dateFilter === "newest" ||
          (dateFilter === "" && sortBy === "latest")
        ) {
          return dateB - dateA; // Newest first
        }
        if (dateFilter === "oldest") {
          return dateA - dateB; // Oldest first
        }

        // Handle other sorting options
        switch (sortBy) {
          case "popular":
            // For now, we'll keep the latest first order
            // TODO: Implement popularity sorting when we have view/like counts
            return dateB - dateA;
          case "trending":
            // For now, we'll keep the latest first order
            // TODO: Implement trending sorting when we have engagement metrics
            return dateB - dateA;
          default:
            return dateB - dateA; // Default to newest first
        }
      });
    };

    // Apply sorting to filtered articles
    filteredArticles = sortArticles(filteredArticles);

    setArticles(filteredArticles);
  }, [searchTerm, selectedCategory, dateFilter, sortBy, initialArticles]);

  return (
    <>
      <ArticlesFilters
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onDateFilterChange={setDateFilter}
        onSortChange={setSortBy}
      />

      <section className="py-12">
        <div className="container mx-auto px-6">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: SanityArticle) => (
                <ArticleCard
                  key={article._id}
                  image={article.image?.asset?.url || "/placeholder.svg"}
                  category={article.categories?.[0]?.title || "General"}
                  title={article.title}
                  description={article.excerpt || ""}
                  author={{
                    name: article.author?.name || "Anonymous",
                    image:
                      article.author?.image?.asset?.url ||
                      "/placeholder-avatar.svg",
                  }}
                  date={article.publishedAt || "No date"}
                  slug={article.slug?.current || ""}
                />
              ))}
            </div>
          ) : (
            <NoArticlesFound />
          )}
        </div>
      </section>
    </>
  );
}
