import Link from "next/link";
import { ReactNode } from "react";
import { SupportCard } from "../ui/support-card";
import { SupportIcon } from "../ui/support-icon";
import { ImpactSection } from "../ui/impact-section";
import {
  Users,
  HandCoins,
  CircleFadingPlus,
  Handshake,
  BriefcaseBusiness,
  CalendarCheck2,
} from "lucide-react";

interface SupportOption {
  icon: ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

export default function WaysToSupportSection() {
  const supportOptions: SupportOption[] = [
    {
      icon: <Handshake className="w-7 h-7 text-[#86AC9D]" />,
      title: "Make a Pledge",
      description:
        "Join a campaign and pledge your support. Your voice matters in creating meaningful change.",
      linkText: "Browse Campaigns",
      linkHref: "/campaigns",
    },
    {
      icon: <HandCoins className="w-7 h-7 text-[#86AC9D]" />,
      title: "Donate",
      description:
        "Support our operations with a one-time or recurring donation. Every contribution helps us expand our impact.",
      linkText: "Donate Now",
      linkHref: "/donate",
    },
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
    {
      icon: <BriefcaseBusiness className="w-7 h-7 text-[#86AC9D]" />,
      title: "Corporate Partnership",
      description:
        "Align your organization with our mission. We offer various partnership opportunities for businesses.",
      linkText: "Become a Partner",
      linkHref: "/partner",
    },
    {
      icon: <CalendarCheck2 className="w-7 h-7 text-[#86AC9D]" />,
      title: "Monthly Giving Program",
      description:
        "Join our Peace Sustainers program with a monthly donation. Provide consistent support for our ongoing initiatives.",
      linkText: "Become a Sustainer",
      linkHref: "/monthly-giving",
    },
  ];

  return (
    <section className="py-16 bg-[#FDFDF0]">
      <div className="container px-4 md:px-6">
        <h2 className="text-5xl font-bold tracking-tighter text-center text-gray-900 mb-4">
          Ways to <span className="text-[#548281]">Support Our Mission</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          There are many ways you can contribute to building a more peaceful
          world. Choose the option that works best for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {supportOptions.map((option, index) => (
            <SupportCard
              key={index}
              icon={option.icon}
              title={option.title}
              description={option.description}
              linkText={option.linkText}
              linkHref={option.linkHref}
            />
          ))}
        </div>

        <div className="mt-12 p-12 bg-[#D6E0B6] rounded-lg shadow-sm group">
          <div className="flex flex-row gap-8 items-center justify-between">
            <div className="w-1/2">
              <h3 className="text-3xl font-bold text-[#2f4858] mb-4">
                Need Help Deciding?
              </h3>
              <p className="text-[#2f4858] mb-6">
                Not sure which support option is right for you? Our team is here
                to help you find the best way to contribute to our peace
                initiatives.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#2f4858] px-6 py-3 text-sm font-medium text-[#2f4858] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
              >
                Contact Our Team
              </Link>
            </div>
            <ImpactSection />
          </div>
        </div>
      </div>
    </section>
  );
}
