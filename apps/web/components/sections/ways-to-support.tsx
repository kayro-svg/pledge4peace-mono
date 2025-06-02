import Link from "next/link";
import { ReactNode } from "react";
import { SupportCard } from "../ui/support-card";
import { SupportIcon } from "../ui/support-icon";
import { ImpactSection } from "../ui/impact-section";
import { SanityIcon } from "../ui/sanity-icon";
import {
  Users,
  HandCoins,
  CircleFadingPlus,
  Handshake,
  BriefcaseBusiness,
  CalendarCheck2,
} from "lucide-react";
import { SanityWaysToSupportSection } from "@/lib/types";

interface SupportOption {
  icon: ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

export default function WaysToSupportSection({
  data,
}: {
  data: SanityWaysToSupportSection;
}) {
  const supportOptions: SupportOption[] = [
    {
      icon: <Handshake className="w-7 h-7 text-[#86AC9D]" />,
      title: "Make a Pledge",
      description:
        "Join a campaign and pledge your support. Your voice matters in creating meaningful change.",
      linkText: "Browse Campaigns",
      linkHref: "/campaigns",
    },
    // {
    //   icon: <HandCoins className="w-7 h-7 text-[#86AC9D]" />,
    //   title: "Donate",
    //   description:
    //     "Support our operations with a one-time or recurring donation. Every contribution helps us expand our impact.",
    //   linkText: "Donate Now",
    //   linkHref: "/donate",
    // },
    {
      icon: <Users className="w-7 h-7 text-[#86AC9D]" />,
      title: "Volunteer",
      description:
        "Contribute your time and skills to our mission. Join our global network of dedicated volunteers.",
      linkText: "Join Our Team",
      linkHref: "/volunteer",
    },
    {
      icon: <CircleFadingPlus className="w-7 h-7 text-[#86AC9D]" />,
      title: "Spread Awareness",
      description:
        "Share our campaigns on social media and help us reach a wider audience. Your voice amplifies our message.",
      linkText: "Share Our Mission",
      linkHref: "/share",
    },
    // {
    //   icon: <BriefcaseBusiness className="w-7 h-7 text-[#86AC9D]" />,
    //   title: "Corporate Partnership",
    //   description:
    //     "Align your organization with our mission. We offer various partnership opportunities for businesses.",
    //   linkText: "Become a Partner",
    //   linkHref: "/partner",
    // },
    // {
    //   icon: <CalendarCheck2 className="w-7 h-7 text-[#86AC9D]" />,
    //   title: "Monthly Giving Program",
    //   description:
    //     "Join our Peace Sustainers program with a monthly donation. Provide consistent support for our ongoing initiatives.",
    //   linkText: "Become a Sustainer",
    //   linkHref: "/monthly-giving",
    // },
  ];

  const DEFAULT_SECTION_DATA = {
    waysToSupportHeading: "Ways to Support Our Mission",
    waysToSupportDescription:
      "There are many ways you can contribute to building a more peaceful world. Choose the option that works best for you.",
    waysToSupportItems: supportOptions.map((option) => ({
      title: option.title,
      description: option.description,
      buttonText: option.linkText,
      buttonLink: option.linkHref,
      icon: { asset: { url: "" } },
    })),
  };

  const sectionData = {
    waysToSupportHeading:
      data?.waysToSupportHeading ?? DEFAULT_SECTION_DATA.waysToSupportHeading,
    waysToSupportDescription:
      data?.waysToSupportDescription ??
      DEFAULT_SECTION_DATA.waysToSupportDescription,
    waysToSupportItems:
      data?.waysToSupportItems?.map((item) => ({
        ...item,
        buttonLink: item.buttonLink || "#",
        buttonText: item.buttonText || "Learn More",
      })) ?? DEFAULT_SECTION_DATA.waysToSupportItems,
  };

  return (
    <div className="bg-[#fdfdf0] w-full py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-[#2F4858] uppercase text-xs sm:text-sm font-medium tracking-wider mb-3 sm:mb-4 border-b-2 w-fit mx-auto border-[#2F4858]">
            WAYS TO SUPPORT
          </h2>
          <h1 className="text-[#2F4858] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {sectionData.waysToSupportHeading}
          </h1>
          <p className="text-[#2F4858] text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4">
            {sectionData.waysToSupportDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {sectionData.waysToSupportItems.map((option, index) => (
            <SupportCard
              key={index}
              icon={
                option.icon?.asset?.url ? (
                  <SanityIcon iconUrl={option.icon.asset.url} />
                ) : (
                  supportOptions[index]?.icon
                )
              }
              title={option.title}
              description={option.description}
              linkText={option.buttonText}
              linkHref={option.buttonLink}
            />
          ))}
        </div>

        <div className="mt-8 sm:mt-12 p-4 sm:p-8 md:p-12 bg-[#D6E0B6] rounded-lg shadow-sm group">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2f4858] mb-3 sm:mb-4">
                Need Help Deciding?
              </h3>
              <p className="text-sm sm:text-base text-[#2f4858] mb-4 sm:mb-6">
                Not sure which support option is right for you? Our team is here
                to help you find the best way to contribute to our peace
                initiatives.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#2f4858] px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-[#2f4858] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
              >
                Contact Our Team
              </Link>
            </div>
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <ImpactSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
