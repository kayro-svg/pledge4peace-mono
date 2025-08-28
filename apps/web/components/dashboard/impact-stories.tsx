"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getArticles } from "@/lib/sanity/queries";
import { useEffect, useState } from "react";
import { SanityArticle } from "@/lib/types";
import { useRouter } from "next/navigation";

const impactStories = [
  {
    title: "Pakistan Flood Relief",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 families affected by floods in Pakistan.",
  },
  {
    title: "Middle East Education",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 children get access to education in Middle East.",
  },
  {
    title: "India Peace Building",

    image: "/placeholder.svg?height=200&width=400",
    description: "Helped 1000 children get access to education in India.",
  },
];

export function ImpactStories(): JSX.Element {
  const [articles, setArticles] = useState<SanityArticle[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchArticles = async () => {
      const articles = await getArticles(2);
      setArticles(articles);
    };
    fetchArticles();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between mt-8">
        <h2 className="text-2xl font-bold text-slate-800">Impact Stories</h2>
        <Button
          variant="outline"
          className="inline-flex items-center w-fit justify-center rounded-full border border-[#548281] px-5 py-2 text-sm text-[#548281] hover:text-white shadow hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
          onClick={() => router.push("/articles")}
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((story) => (
          <ImpactStoryCard
            key={story.title}
            title={story.title}
            image={story.image?.asset?.url || "/placeholder.svg"}
            description={story.excerpt || ""}
            slug={story.slug.current}
          />
        ))}
      </div>
    </div>
  );
}

interface ImpactStoryCardProps {
  title: string;
  image: string;
  description: string;
  slug: string;
}

function ImpactStoryCard({
  title,
  image,
  description,
  slug,
}: ImpactStoryCardProps) {
  const router = useRouter();
  return (
    <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <Image
          src={getSanityImageUrl(image || "/placeholder.svg", 800, 450, 80)}
          alt={title}
          width={400}
          height={200}
          className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer"
          onClick={() => router.push(`/articles/${slug}`)}
        />
      </div>
      <CardHeader className="p-4 pb-1">
        <CardTitle
          className="line-clamp-2 text-base cursor-pointer hover:text-[#548281]"
          onClick={() => router.push(`/articles/${slug}`)}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-1">
        <CardDescription className="line-clamp-3 text-sm">
          {description}
        </CardDescription>
      </CardContent>
      <div className="p-4">
        <Button
          className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-sm rounded-full"
          onClick={() => router.push(`/articles/${slug}`)}
        >
          Read Full Story
        </Button>
      </div>
    </Card>
  );
}
