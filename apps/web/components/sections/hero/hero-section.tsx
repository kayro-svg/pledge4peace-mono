import { ChartNoAxesCombined, HandHeart, HeartHandshake } from "lucide-react";
import HeroVideo from "../../ui/hero-video";
import HeroStats from "./hero-stats";
// import { useHomePageData } from "@/hooks/useSanityData";
import { HomePageData } from "@/lib/types";
import HeroButtons from "./hero-buttons";

export default function HeroSection({ data }: { data: HomePageData }) {
  const stats = [
    {
      icon: <ChartNoAxesCombined className="text-[#2F4858]" />,
      value: "100,000",
      label: "Pledges Made",
      type: "pledgesMade",
    },
    {
      icon: <HeartHandshake className="text-[#2F4858]" />,
      value: "5000",
      label: "Peace activists",
      type: "peaceActivists",
    },
    {
      icon: <HandHeart className="text-[#2F4858]" />,
      value: "100",
      label: "Donors",
      type: "donors",
    },
  ];

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
        <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4 text-[#2F4858]">
          {firstPartOfHeroHeading},
          <span className="text-[#86AC9D]">{secondPartOfHeroHeading}</span>
        </h1>
      );
    } else {
      return (
        <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4 text-[#2F4858]">
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
        <p className="text-1xl md:text-xl mt-4 mb-8 text-[#2F4858] max-w-xl">
          {firstPart}
          <span className="text-[#86AC9D]">Pledge4Peace</span>
          {secondPart}
        </p>
      );
    }
    return (
      <p className="text-1xl md:text-xl mt-4 mb-8 text-[#2F4858] max-w-xl">
        {heroData.heroSubheading}
      </p>
    );
  };

  return (
    <section className="flex flex-row w-full h-fit overflow-hidden items-start px-8 pr-0 py-16 gap-4">
      <div className="flex flex-col gap-8 w-[45%]">
        <div className="mx-auto h-full flex flex-col">
          <div className="inline-block w-fit px-4 mb-6 bg-[#86AC9D] backdrop-blur-sm text-[#2F4858] bg-opacity-25 rounded-full text-sm font-medium ">
            Building Peace Together
          </div>
          {headingText()}
          {paragraphText()}
          <HeroButtons data={heroData} />
        </div>
        <HeroStats stats={stats} />
      </div>

      <div className="relative mr-[-50px] w-[55%] right-0">
        <HeroVideo />
      </div>
    </section>
  );
}
