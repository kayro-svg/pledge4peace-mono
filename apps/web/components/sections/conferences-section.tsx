import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ConferenceCard from "@/components/ui/conference-card";

export default function ConferencesSection() {
  // Generate 3 placeholder conferences
  const conferences = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    image: "/placeholder.svg?height=200&width=300",
    date: "July 20-24, 2023",
    title: "Peace Conference for Israel & Palestine: A Free online conference",
    description:
      "Join Global Leaders in Shaping Lasting Peace. Israel-Palestine Peace Conference brings together global leaders, academics, and activists to discuss paths toward lasting peace in the region.",
  }));

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div>
            <h3 className="section-title mb-4  text-[#2F4858]">
              Conferences and Events
            </h3>
            <p className="text-[#2F4858] max-w-2xl">
              Join our upcoming conferences and events to connect with peace
              advocates from around the world.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conferences.map((conference) => (
            <ConferenceCard
              key={conference.id}
              image={conference.image}
              date={conference.date}
              title={conference.title}
              description={conference.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
