import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeaturedArticle from "@/components/ui/featured-article";
import SmallArticle from "@/components/ui/small-article";
import { SanityArticle, SanityArticlesSection } from "@/lib/types";
import { useTranslations } from "next-intl";
interface DefaultArticle {
  image: string;
  date: string;
  title: string;
  description: string;
  slug: string;
}

function isSanityArticle(article: any): article is SanityArticle {
  return article && "_id" in article;
}

function getArticleImage(article: SanityArticle | DefaultArticle): string {
  if (isSanityArticle(article) && article.image?.asset?.url) {
    return article.image.asset.url;
  }
  return typeof article.image === "string"
    ? article.image
    : "/placeholder.svg?height=400&width=600";
}

function getArticleDate(article: SanityArticle | DefaultArticle): string {
  if (isSanityArticle(article)) {
    return article.publishedAt ?? "No date available";
  }
  return article.date;
}

function getArticleDescription(
  article: SanityArticle | DefaultArticle
): string {
  if (isSanityArticle(article)) {
    return article.excerpt ?? "No description available";
  }
  return article.description;
}

function getArticleSlug(article: SanityArticle | DefaultArticle): string {
  if (isSanityArticle(article)) {
    return article.slug?.current ?? "";
  }
  return article.slug;
}

export default function ArticlesSection({
  data,
}: {
  data: SanityArticlesSection;
}) {
  const t = useTranslations("Articles_Home");
  const defaultArticles: DefaultArticle[] = [
    {
      image: "/placeholder.svg?height=150&width=150",
      date: "October 16, 2023",
      title: "Faith & Politics: Virtual Conference",
      description:
        "The role of faith in shaping political discourse in the United States and the world at large.",
      slug: "faith-and-politics-virtual-conference",
    },
    {
      image: "/placeholder.svg?height=150&width=150",
      date: "October 15, 2023",
      title: "Redefining Peace: The North Equation",
      description: "A new framework for sustainable peace in the world.",
      slug: "redefining-peace-the-north-equation",
    },
    {
      image: "/placeholder.svg?height=400&width=600",
      date: "October 14, 2023",
      title: "Chile's Road to a New Constitution",
      description:
        "After years of protests and political upheaval, Chile is embarking on a historic journey to rewrite its constitution.",
      slug: "chiles-road-to-a-new-constitution",
    },
  ];

  const DEFAULT_SECTION_DATA = {
    articlesHeading: "Articles & Updates",
    articlesDescription:
      "Find insightful content on global peace efforts, updates on our initiatives, and expert perspectives.",
    articles: defaultArticles,
  };

  const sectionData = {
    articlesHeading:
      data?.articlesHeading ?? DEFAULT_SECTION_DATA.articlesHeading,
    articlesDescription:
      data?.articlesDescription ?? DEFAULT_SECTION_DATA.articlesDescription,
    articles: data?.articles ?? DEFAULT_SECTION_DATA.articles,
  };

  // Asegurarse de que tenemos un array de artículos
  const articles = Array.isArray(sectionData.articles)
    ? sectionData.articles
    : [];

  // Obtener el último artículo para featured
  const lastArticle =
    articles.length > 0
      ? articles[articles.length - 1]
      : defaultArticles[defaultArticles.length - 1];

  const featuredArticle = {
    image: getArticleImage(lastArticle),
    date: getArticleDate(lastArticle),
    title: lastArticle.title,
    description: getArticleDescription(lastArticle),
    slug: getArticleSlug(lastArticle),
  };

  // Obtener todos los artículos excepto el último para small articles
  const smallArticles =
    articles.length > 0
      ? articles.slice(0, -1).map((article) => ({
          image: getArticleImage(article),
          title: article.title,
          description: getArticleDescription(article),
          date: getArticleDate(article),
          slug: getArticleSlug(article),
        }))
      : defaultArticles.slice(0, -1);

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-16">
        <div className="w-full md:w-2/3">
          <h1 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            {sectionData.articlesHeading}
          </h1>
          <p className="text-[#2F4858] text-lg md:text-xl lg:text-xl">
            {sectionData.articlesDescription}
          </p>
        </div>
        <Link
          href="/articles"
          className="mt-6 md:mt-0 text-brand-500 text-lg md:text-xl lg:text-xl font-medium flex items-center justify-center border border-[#548281] text-[#548281] hover:bg-[#2F4858] hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-full md:w-fit"
        >
          {t("viewAllUpdates")}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <FeaturedArticle
          image={featuredArticle.image}
          date={featuredArticle.date}
          title={featuredArticle.title}
          description={featuredArticle.description}
          slug={`/articles/${featuredArticle.slug}`}
        />

        <div className="grid grid-cols-1 gap-6">
          {smallArticles.map((article, index) => (
            <SmallArticle
              key={index}
              image={article.image}
              title={article.title}
              description={article.description}
              date={article.date}
              slug={`/articles/${article.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
