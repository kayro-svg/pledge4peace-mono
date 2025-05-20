import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeaturedArticle from "@/components/ui/featured-article";
import SmallArticle from "@/components/ui/small-article";

export default function ArticlesSection() {
  const featuredArticle = {
    image: "/placeholder.svg?height=400&width=600",
    date: "October 16, 2023",
    title: "Chile's Road to a New Constitution",
    description:
      "After years of protests and political upheaval, Chile is embarking on a historic journey to rewrite its constitution.",
  };

  const smallArticles = [
    {
      image: "/placeholder.svg?height=150&width=150",
      title: "Faith & Politics: Virtual Conference",
      description:
        "The role of faith in shaping political discourse in the United States and the world at large. This conference will explore historical contexts, current challenges, and future possibilities for integrating faith-based perspectives into political frameworks.",
    },
    {
      image: "/placeholder.svg?height=150&width=150",
      title: "Redefining Peace: The North Equation",
      description:
        "A new framework for sustainable peace in the world. This conference will explore historical contexts, current challenges, and future possibilities for integrating faith-based perspectives into political frameworks.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div>
            <h3 className="section-title mb-4 text-[#2F4858]">
              Articles & Updates
            </h3>
            <p className="text-[#2F4858] max-w-2xl">
              Find insightful content on global peace efforts, updates on our
              initiatives, and expert perspectives.
            </p>
          </div>
          <Link
            href="/articles"
            className="mt-6 md:mt-0 text-brand-500 font-medium flex items-center border border-[#548281] text-[#548281] hover:bg-[#2F4858] hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
          >
            View all updates{" "}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeaturedArticle
            image={featuredArticle.image}
            date={featuredArticle.date}
            title={featuredArticle.title}
            description={featuredArticle.description}
          />

          <div className="grid grid-cols-1 gap-6">
            {smallArticles.map((article, index) => (
              <SmallArticle
                key={index}
                image={article.image}
                title={article.title}
                description={article.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
