"use client";

import { Button } from "@/components/ui/button";
import { SanityVolunteerImpactSection } from "@/lib/types";

interface VolunteerCtaBannerProps {
  impactSection: SanityVolunteerImpactSection;
}

export default function VolunteerCtaBanner({
  impactSection,
}: VolunteerCtaBannerProps) {
  const handleJoinNowClick = () => {
    const element = document.querySelector("#volunteer-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="bg-gradient-to-r from-[#2F4858] to-[#548281] py-16 px-4 text-white">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {impactSection.impactHeading}
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          {impactSection.impactParagraph}
        </p>
        <Button
          className="bg-white text-[#2F4858] hover:bg-gray-100"
          onClick={handleJoinNowClick}
        >
          {impactSection.impactButtonText}
        </Button>
      </div>
    </section>
  );
}
