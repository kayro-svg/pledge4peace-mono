import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ConferenceCard from "@/components/ui/conference-card";
import ExtendedEventCard from "@/components/ui/extended-event-card";
import { SanityConferencesSection } from "@/lib/types";

export default function ConferencesSection({
  data,
}: {
  data: SanityConferencesSection;
}) {
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
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div>
            <h3 className="section-title mb-4 text-[#2F4858]">
              {sectionData.conferencesHeading}
            </h3>
            <p className="text-[#2F4858] max-w-2xl">
              {sectionData.conferencesDescription}
            </p>
          </div>
          <Link
            href="/events"
            className="mt-6 md:mt-0 text-brand-500 font-medium flex items-center border border-[#548281] text-[#548281] hover:bg-[#2F4858] hover:text-white transition-colors py-2 px-4 rounded-full group/btn w-fit"
          >
            See all events{" "}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isSingleConference ? (
          // Diseño expandido para una sola conferencia
          <div className="space-y-8">
            {sectionData.conferences.map((conference) => (
              <ExtendedEventCard
                key={conference._id}
                id={conference._id}
                title={conference.title}
                date={conference.date}
                description={conference.description}
                location={conference.location}
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
                date={conference.date ?? "No date available"}
                title={conference.title ?? "No title available"}
                description={
                  conference.description ?? "No description available"
                }
                slug={`/events/${conference.slug.current}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
