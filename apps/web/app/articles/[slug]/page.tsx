import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { getArticleBySlug } from "@/lib/sanity/queries";
import { formatDate } from "@/lib/utils";
import ShareButtons from "@/components/ui/share-buttons";
import { portableTextComponents } from "@/components/ui/portable-text-components";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { article, relatedArticles } = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image
          src={article.image?.asset?.url || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Title and Meta */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 text-gray-600">
              <div className="flex items-center gap-3">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={
                        article.author?.image?.asset?.url ||
                        "/p4p_rounded_logo.png"
                      }
                      alt={article.author?.name || "Author"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">{article.author?.name}</span>
                </div>

                {/* Date */}
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </div>
              {/* Categories */}
              <div className="flex gap-2">
                {article.categories?.map((category) => (
                  <span
                    key={category._id}
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: getCategoryColor(category.title),
                      color: "white",
                    }}
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Share Buttons */}
          <div className="mb-8">
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug.current}`}
              title={article.title}
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-16">
            <PortableText
              value={article.content}
              components={portableTextComponents}
            />
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle._id}
                    href={`/articles/${relatedArticle.slug.current}`}
                    className="group"
                  >
                    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            relatedArticle.image?.asset?.url ||
                            "/placeholder.svg"
                          }
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        {/* Categories */}
                        {relatedArticle.categories?.[0] && (
                          <span
                            className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
                            style={{
                              backgroundColor: getCategoryColor(
                                relatedArticle.categories[0].title
                              ),
                              color: "white",
                            }}
                          >
                            {relatedArticle.categories[0].title}
                          </span>
                        )}

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#548281] transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>

                        {/* Author and Date */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={
                                relatedArticle.author?.image?.asset?.url ||
                                "/p4p_rounded_logo.png"
                              }
                              alt={relatedArticle.author?.name || "Author"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {relatedArticle.author?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(relatedArticle.publishedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    "Peace Initiatives": "#548281",
    Community: "#FF6B6B",
    Events: "#4ECDC4",
    General: "#95A5A6",
  };

  return colors[category] || colors["General"];
}
