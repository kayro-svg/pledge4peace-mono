import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

interface ConferenceCardProps {
  image: string;
  date: string;
  title: string;
  description: string;
}

export default function ConferenceCard({
  image,
  date,
  title,
  description,
}: ConferenceCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col p-5 gap-5">
        <div className="flex items-center text-sm text-[#2F4858]">
          <Calendar className="w-4 h-4 mr-1" />
          {date}
        </div>
        <h4 className="text-lg font-bold line-clamp-2 group-hover:text-brand-500 transition-colors text-[#2F4858]">
          {title}
        </h4>
        <p className="text-sm text-[#2F4858] line-clamp-3">{description}</p>
        <Link
          href="/conference-details"
          className="inline-flex items-center text-[#548281] font-medium text-sm bg-brand-500 border border-[#548281] group-hover:bg-[#2F4858] group-hover:border-transparent group-hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
        >
          Register Now{" "}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
