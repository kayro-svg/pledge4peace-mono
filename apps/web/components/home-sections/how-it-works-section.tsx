"use client";

import StepsDisplay from "@/components/ui/steps-display";
import { SanityHowItWorksSection } from "@/lib/types";
import { Award, HandshakeIcon, UserPlus } from "lucide-react";

export default function HowItWorksSection({
  data,
}: {
  data: SanityHowItWorksSection;
}) {
  const sectionData = data || {
    howItWorksHeading: "How Pledge4Peace Works",
    howItWorksDescription:
      "Join our global movement in three simple steps and help us build a more peaceful world.",
    howItWorksSteps: [
      {
        icon: <UserPlus className="w-8 h-8 text-brand-500" />,
        title: "Register as a P4P Member",
        description:
          "Sign up to our community and join us in the movement for a better world.",
      },
      {
        icon: <HandshakeIcon className="w-8 h-8 text-brand-500" />,
        title: "Pledge",
        description:
          "Make your pledge to support causes and initiatives that matter to you.",
      },
      {
        icon: <Award className="w-8 h-8 text-brand-500" />,
        title: "Endorse",
        description:
          "Endorse and promote peace initiatives that align with your values.",
      },
    ],
  };

  const setStepsIconByIndex = (index: number) => {
    switch (index) {
      case 0:
        return <UserPlus className="w-8 h-8 text-brand-500" />;
      case 1:
        return <HandshakeIcon className="w-8 h-8 text-brand-500" />;
      case 2:
        return <Award className="w-8 h-8 text-brand-500" />;
      default:
        return <UserPlus className="w-8 h-8 text-brand-500" />;
    }
  };

  const steps = sectionData.howItWorksSteps.map((step, index) => ({
    ...step,
    icon: setStepsIconByIndex(index),
  }));

  const headingText = () => {
    const [firstPart, secondPart] =
      sectionData.howItWorksHeading.split("Pledge4Peace");
    const pledge4peaceTextExist =
      sectionData.howItWorksHeading.includes("Pledge4Peace");
    if (pledge4peaceTextExist) {
      return (
        <div className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
          {firstPart}
          <span className="text-[#86AC9D] text-4xl md:text-5xl">
            Pledge4Peace
          </span>
          {secondPart}
        </div>
      );
    }
    return (
      <h1 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
        {sectionData.howItWorksHeading}
      </h1>
    );
  };

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="text-center mb-12">
        {headingText()}
        <p className="section-subtitle text-[#2F4858] text-lg md:text-xl lg:text-xl">
          {sectionData.howItWorksDescription}
        </p>
      </div>
      <StepsDisplay steps={steps} />
    </section>
  );
}
