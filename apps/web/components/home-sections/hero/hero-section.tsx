"use client";

import { ChartNoAxesCombined, HandHeart, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import HeroVideo from "../../ui/hero-video";
import HeroStats from "./hero-stats";
import HeroButtons from "./hero-buttons";
import { SanityHeroSection } from "@/lib/types";
import { useStats } from "@/hooks/useStats";

export default function HeroSection({ data }: { data: SanityHeroSection }) {
  const { stats, isLoading, error } = useStats();

  const [displayStats, setDisplayStats] = useState([
    {
      icon: <ChartNoAxesCombined className="text-[#2F4858] h-8 w-8" />,
      value: "0",
      label: "Pledges Made",
      type: "pledgesMade",
    },
    {
      icon: <HeartHandshake className="text-[#2F4858] h-8 w-8" />,
      value: "0",
      label: "Peace Activists",
      type: "peaceActivists",
    },
    // {
    //   icon: <HandHeart className="text-[#2F4858]" />,
    //   value: "0",
    //   label: "Donors",
    //   type: "donors",
    // },
  ]);

  // Handle loading and error states
  useEffect(() => {
    if (isLoading) return; // Don't update while loading

    if (error) {
      console.error("Error loading stats:", error);
      // Keep the default/placeholder values
      return;
    }

    if (stats) {
      setDisplayStats((prev) => [
        { ...prev[0], value: stats.pledgesMade.toString() },
        { ...prev[1], value: stats.peaceActivists.toString() },
        // { ...prev[2], value: stats.peaceActivists.toString() }, // Using same count for donors for now
      ]);
    }
  }, [stats, isLoading, error]);

  const heroData = data || {
    heroHeading: "Pledge For Peace",
    heroSubheading:
      "Join our global movement to promote peace through pledges, advocacy, and action.",
    heroPrimaryButtonText: "Make a Pledge",
    heroSecondaryButtonText: "Learn More",
  };

  const [firstPartOfHeroHeading, secondPartOfHeroHeading] =
    heroData.heroHeading.split(",");

  const headingText = () => {
    const isHeadingDividedByComma = heroData.heroHeading.includes(",");
    if (isHeadingDividedByComma) {
      return (
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 text-[#2F4858] leading-tight">
          {firstPartOfHeroHeading},
          <span className="text-[#86AC9D] text-4xl lg:text-5xl xl:text-6xl">
            {secondPartOfHeroHeading}
          </span>
        </h1>
      );
    } else {
      return (
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 text-[#2F4858] leading-tight">
          {heroData.heroHeading}
        </h1>
      );
    }
  };

  const paragraphText = () => {
    const [firstPart, secondPart] =
      heroData.heroSubheading.split("Pledge4Peace");
    const pledge4peaceTextExist =
      heroData.heroSubheading.includes("Pledge4Peace");
    if (pledge4peaceTextExist) {
      return (
        <p className="text-lg lg:text-xl mt-2 sm:mt-4 mb-4 sm:mb-6 md:mb-8 text-[#2F4858] max-w-xl leading-relaxed">
          {firstPart}
          <span className="text-[#86AC9D] text-lg lg:text-xl">
            Pledge4Peace
          </span>
          {secondPart}
        </p>
      );
    }
    return (
      <p className="text-lg lg:text-xl mt-2 sm:mt-4 mb-4 sm:mb-6 md:mb-8 text-[#2F4858] max-w-xl leading-relaxed">
        {heroData.heroSubheading}
      </p>
    );
  };

  return (
    <section className="w-full h-fit overflow-hidden py-0 md:py-16 p-0 lg:pl-8">
      {/* Responsive layout - stack on mobile, side-by-side on larger screens */}
      <div className="flex flex-col-reverse md:flex-row w-full items-center md:items-start gap-8 md:gap-4">
        {/* Content column - takes full width on mobile, 45% on desktop */}
        <div className="flex flex-col gap-6 md:gap-8 w-full md:w-[45%] px-4 md:px-0">
          <div className="h-full flex flex-col">
            {/* Badge */}
            <div className="inline-block w-fit px-4 py-1 mb-4 md:mb-6 bg-[#86AC9D] backdrop-blur-sm text-[#2F4858] bg-opacity-25 rounded-full text-xs lg:text-sm font-medium">
              Building Peace Together
            </div>

            {/* Heading and content */}
            {headingText()}
            {paragraphText()}
            <HeroButtons data={heroData} />
          </div>

          {/* Stats - hidden on smallest screens */}
          <div className="w-full mt-4">
            <HeroStats stats={displayStats} />
          </div>
        </div>

        {/* Video column - takes full width on mobile, 55% on desktop */}
        <div className="relative w-full md:w-[55%] md:right-0 md:mr-[-50px] mt-0">
          <HeroVideo videoUrl={heroData.heroVideo?.asset.url} />
        </div>
      </div>
    </section>
  );
}
