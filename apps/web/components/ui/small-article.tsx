import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SmallArticleProps {
  image: string;
  title: string;
  description: string;
}

export default function SmallArticle({
  image,
  title,
  description,
}: SmallArticleProps) {
  return (
    <div className="flex rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative w-1/3 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="w-2/3 p-5 flex flex-col justify-between">
        <h4 className="text-lg font-bold mb-2 group-hover:text-brand-500 transition-colors text-[#2F4858]">
          {title}
        </h4>
        <p className="text-sm text-[#2F4858] mb-3 line-clamp-3">
          {description}
        </p>
        <Link
          href="/article"
          className="inline-flex items-center text-[#548281] font-medium text-sm bg-brand-500 border border-[#548281] group-hover:bg-[#2F4858] group-hover:border-transparent group-hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
        >
          Read More{" "}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
