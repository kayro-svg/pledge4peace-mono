"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ConferenceCard from "@/components/ui/conference-card";
import ExtendedEventCard from "@/components/ui/extended-event-card";
import { SanityConferencesSection } from "@/lib/types";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { useTranslations } from "next-intl";
export default function ConferencesSection({
  data,
}: {
  data: SanityConferencesSection;
}) {
  const { getString } = useLocaleContent();
  const t = useTranslations("Conferences_Home");
  // Generate 3 placeholder conferences
  const conferences = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    image: "/placeholder.svg?height=200&width=300",
    date: "July 20-24, 2023",
    title: "Peace Conference for Israel & Palestine: A Free online conference",
    description:
      "Join Global Leaders in Shaping Lasting Peace. Israel-Palestine Peace Conference brings together global leaders, academics, and activists to discuss paths toward lasting peace in the region.",
    slug: "/events/peace-conference-for-israel-and-palestine-a-free-online-conference",
  }));

  const DEFAULT_SECTION_DATA = {
    conferencesHeading: "Conferences and Events",
    conferencesDescription:
      "Join our upcoming conferences and events to connect with peace advocates from around the world.",
    conferences: conferences,
  };

  const sectionData = {
    conferencesHeading:
      data?.conferencesHeading ?? DEFAULT_SECTION_DATA.conferencesHeading,
    conferencesDescription:
      data?.conferencesDescription ??
      DEFAULT_SECTION_DATA.conferencesDescription,
    conferences: data?.conferences ?? DEFAULT_SECTION_DATA.conferences,
  };

  const isSingleConference = sectionData.conferences.length === 1;

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-16">
        <div className="w-full md:w-2/3">
          <h2 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            {sectionData.conferencesHeading}
          </h2>
          <p className="text-[#2F4858] text-lg md:text-xl lg:text-xl">
            {sectionData.conferencesDescription}
          </p>
        </div>
        <Link
          href="/events"
          className="mt-6 md:mt-0 text-brand-500 font-medium flex items-center justify-center border border-[#548281] text-[#548281] hover:bg-[#2F4858] hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-full md:w-fit"
        >
          {t("viewAllEvents")}
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {sectionData.conferences.length < 2 ? (
        // Diseño expandido para una sola conferencia
        <div className="space-y-8">
          {sectionData.conferences.map((conference) => (
            <ExtendedEventCard
              key={conference._id}
              id={conference._id}
              title={
                getString(conference.title) ||
                (typeof conference.title === "string" ? conference.title : "")
              }
              startDateTime={conference.startDateTime}
              endDateTime={conference.endDateTime}
              timezone={conference.timezone}
              description={
                getString(conference.description) ||
                (typeof conference.description === "string"
                  ? conference.description
                  : "")
              }
              location={
                getString(conference.location) ||
                (typeof conference.location === "string"
                  ? conference.location
                  : "")
              }
              imageUrl={conference.image?.asset?.url || "/placeholder.svg"}
              slug={conference.slug.current}
            />
          ))}
        </div>
      ) : (
        // Diseño de cards compactas para múltiples conferencias
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sectionData.conferences.map((conference, index) => (
            <ConferenceCard
              key={index}
              image={conference.image?.asset?.url ?? "/placeholder.svg"}
              date={conference.startDateTime ?? "No date available"}
              title={
                getString(conference.title) ||
                (typeof conference.title === "string"
                  ? conference.title
                  : "No title available")
              }
              description={
                getString(conference.description) ||
                (typeof conference.description === "string"
                  ? conference.description
                  : "No description available")
              }
              slug={`/events/${conference.slug.current}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
