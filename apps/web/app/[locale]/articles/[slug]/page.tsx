import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { getArticleBySlug } from "@/lib/sanity/queries";
import { formatDate } from "@/lib/utils";
import ShareButtons from "@/components/ui/share-buttons";
import { portableTextComponents } from "@/components/ui/portable-text-components";
import { Metadata } from "next";
import { SEODebug } from "@/components/dev/seo-debug";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export async function generateStaticParams() {
  const locales = ["en", "es"]; // ajusta según i18n
  return locales.map((locale) => ({ locale }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, locale } = resolvedParams;
  const { article } = await getArticleBySlug(slug, locale as "en" | "es");

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const articleUrl = `${baseUrl}/articles/${article.slug.current}`;

  // Use SEO fields if available, otherwise fallback to default fields
  const title = article.seo?.metaTitle || article.title;
  const description = article.seo?.metaDescription || article.excerpt || "";
  const keywords = article.seo?.keywords || [];
  const ogImage = article.seo?.ogImage?.asset?.url || article.image?.asset?.url;
  const noIndex = article.seo?.noIndex || false;
  const canonicalUrl = article.seo?.canonicalUrl || articleUrl;

  return {
    title,
    description,
    keywords: keywords.join(", "),

    // Open Graph
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: "Pledge4Peace",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      locale: "en_US",
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : [],
      section: article.categories?.[0]?.title || "General",
      tags: keywords,
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
      creator: article.author?.name
        ? `@${article.author.name.replace(/\s+/g, "")}`
        : "@Pledge4Peace",
    },

    // Additional SEO
    alternates: {
      canonical: canonicalUrl,
    },

    // Control indexing
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },

    // Article specific
    other: {
      "article:published_time": article.publishedAt,
      "article:author": article.author?.name || "",
      "article:section": article.categories?.[0]?.title || "General",
      "article:tag": keywords.join(","),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, locale } = resolvedParams;
  const { article, relatedArticles } = await getArticleBySlug(
    slug,
    locale as "en" | "es"
  );

  if (!article) {
    notFound();
  }

  // Schema.org structured data for SEO
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const articleUrl = `${baseUrl}/articles/${article.slug.current}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || "",
    image: article.image?.asset?.url
      ? [getSanityImageUrl(article.image.asset.url, 1200, 630, 80)]
      : [],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author?.name || "Pledge4Peace Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Pledge4Peace",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/p4p_logo_renewed.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    articleSection: article.categories?.[0]?.title || "General",
    keywords: article.seo?.keywords?.join(", ") || "",
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Image */}
        <div className="relative w-full h-[240px] md:h-[500px]">
          <Image
            src={getSanityImageUrl(
              article.image?.asset?.url || "/placeholder.svg",
              1920,
              1080,
              80
            )}
            alt={article.title}
            fill
            className="object-contain lg:object-cover"
            priority
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <article className="max-w-3xl mx-auto">
            {/* Title and Meta */}
            <header className="mb-2 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-0 md:mb-4">
                {article.title}
              </h1>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 text-gray-600">
                <div className="flex items-center gap-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={getSanityImageUrl(
                          article.author?.image?.asset?.url ||
                            "/p4p_rounded_logo.png",
                          64,
                          64,
                          80
                        )}
                        alt={article.author?.name || "Author"}
                        fill
                        className="object-cover"
                        sizes="40px"
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
                url={`${baseUrl}/articles/${article.slug.current}`}
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
                            src={getSanityImageUrl(
                              relatedArticle.image?.asset?.url ||
                                "/placeholder.svg",
                              800,
                              450,
                              80
                            )}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
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
                                src={getSanityImageUrl(
                                  relatedArticle.author?.image?.asset?.url ||
                                    "/p4p_rounded_logo.png",
                                  64,
                                  64,
                                  80
                                )}
                                alt={relatedArticle.author?.name || "Author"}
                                fill
                                className="object-cover"
                                sizes="32px"
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

      {/* SEO Debug Component (only shows in development) */}
      <SEODebug article={article} />
    </>
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
