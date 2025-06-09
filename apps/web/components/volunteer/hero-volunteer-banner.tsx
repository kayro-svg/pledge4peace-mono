"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SanityVolunteerHeroSection } from "@/lib/types";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";

interface HeroVolunteerBannerProps {
  heroSection: SanityVolunteerHeroSection;
}

export default function HeroVolunteerBanner({
  heroSection,
}: HeroVolunteerBannerProps) {
  const router = useRouter();

  const handleJoinNowClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.preventDefault();
    document
      .querySelector("#volunteer-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBecomePartnerClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.preventDefault();
    document
      .querySelector("#partnerships")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // <section className="bg-gradient-to-r from-[#86AC9D] to-[#9fc075] py-16 px-4 text-white">
    <section className="py-8 lg:py-16">
      <div className="px-4 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#2F4858]">
              {heroSection.heroHeading}
            </h1>
            <p className="text-lg mb-8 text-[#2F4858]">
              {heroSection.heroSubheading}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-[#548281] text-white group"
                onClick={handleJoinNowClick}
              >
                {heroSection.heroButtonText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative h-[300px] md:h-[400px] w-full shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden">
            {hasSanityImage(heroSection.heroBgImage) ? (
              <Image
                src={getSanityImageUrl(heroSection.heroBgImage, 800, 600)}
                alt="Volunteers making a difference"
                className="object-cover w-full h-full"
                fill
              />
            ) : (
              <Image
                src="/volunteers.png"
                alt="Volunteers making a difference"
                className="object-cover w-full h-full"
                fill
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
