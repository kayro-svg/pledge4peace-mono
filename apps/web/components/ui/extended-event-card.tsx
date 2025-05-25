import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

interface ExtendedEventCardProps {
  id: string;
  title: string;
  date: string;
  description: string;
  location?: string;
  imageUrl: string;
  slug: string;
}

export default function ExtendedEventCard({
  id,
  title,
  date,
  description,
  location,
  imageUrl,
  slug,
}: ExtendedEventCardProps) {
  const eventDate = new Date(date + "T00:00:00");

  return (
    <article
      key={id}
      className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8"
    >
      {/* Date Column */}
      <div className="w-full md:w-32 flex-shrink-0">
        <div className="text-center md:text-left">
          <div className="text-4xl font-bold text-gray-900">
            {eventDate.getUTCDate()}
          </div>
          <div className="text-lg text-gray-600 uppercase">
            {eventDate.toLocaleString("default", { month: "short" })}
          </div>
        </div>
      </div>

      {/* Image Column */}
      <div className="relative w-full md:w-96 h-48 flex-shrink-0">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Content Column */}
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          <Link
            href={`/events/${slug}`}
            className="hover:text-[#548281] transition-colors"
          >
            {title}
          </Link>
        </h3>

        <div className="flex items-center gap-6 text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>
              {eventDate.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors"
        >
          View Event Details
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </article>
  );
}
