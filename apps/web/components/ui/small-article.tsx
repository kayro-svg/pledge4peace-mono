import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SanitySlug } from "@/lib/types";
import { useRouter } from "next/navigation";

interface SmallArticleProps {
  image: string;
  title: string;
  description: string;
  date: string;
  slug: string | SanitySlug;
}

export default function SmallArticle({
  image,
  title,
  description,
  date,
  slug,
}: SmallArticleProps) {
  const router = useRouter();
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 group">
      <div
        className="relative w-[100%] h-[200px] md:w-1/3 md:h-[100%] overflow-hidden cursor-pointer"
        onClick={() => router.push(slug as string)}
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="w-full md:w-2/3 gap-4 p-5 flex flex-col justify-between">
        <div className="flex flex-col justify-between gap-2">
          <div className="flex flex-col justify-start gap-0 items-start">
            <h4
              className="text-lg font-bold group-hover:text-brand-500 transition-colors text-[#2F4858] cursor-pointer"
              onClick={() => router.push(slug as string)}
            >
              {title}
            </h4>
            <p className="text-sm text-[#2F4858] line-clamp-3">
              {formattedDate}
            </p>
          </div>
          <p className="text-sm text-[#2F4858] line-clamp-3">{description}</p>
        </div>
        <Link
          href={slug as string}
          className="inline-flex items-center text-[#548281] font-medium text-sm bg-brand-500 border border-[#548281] group-hover:bg-[#2F4858] group-hover:border-transparent group-hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
        >
          Read More{" "}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
