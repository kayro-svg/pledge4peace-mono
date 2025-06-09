"use client";

import { SanityVolunteerWaysToVolunteerSection } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface WaysToVolunteerProps {
  waysToVolunteerSection: SanityVolunteerWaysToVolunteerSection;
  icons: React.ReactNode[];
}

export default function WaysToVolunteer({
  waysToVolunteerSection,
  icons,
}: WaysToVolunteerProps) {
  // Create volunteer ways by combining data with icons
  const volunteerWays = [
    {
      icon: icons[0],
      title: "High-Profile Outreach",
      description:
        "Connect with celebrities, politicians, and influential figures to expand our reach and impact.",
      learnMore: "#high-profile",
    },
    {
      icon: icons[1],
      title: "Community Campaigns",
      description:
        "Launch local initiatives that spread our message of peace through neighborhood outreach and engagement.",
      learnMore: "#spread-word",
    },
  ];
  return (
    <section className="py-16 px-4" id="ways-to-volunteer">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858]">
            {waysToVolunteerSection.waysToVolunteerHeading}
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            {waysToVolunteerSection.waysToVolunteerParagraph}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {volunteerWays.map((way, index) => (
            <div
              key={index}
              className="bg-white group rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-start justify-between"
            >
              <div className="w-16 h-16 rounded-full bg-white border-4 border-[#548281] flex items-center justify-center mb-4">
                {way.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {way.title}
              </h3>
              <p className="text-gray-600 mb-4">{way.description}</p>
              <div className="flex-grow"></div>
              <Button
                onClick={() => {
                  if (way.learnMore) {
                    const element = document.querySelector(way.learnMore);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                variant="outline"
                className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-6 py-3 text-sm font-medium text-[#548281] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
              >
                Learn more{" "}
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
