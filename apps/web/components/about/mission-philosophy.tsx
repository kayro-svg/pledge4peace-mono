import Image from "next/image";
import CharterSection from "@/components/about/charter-section";
import {
  SanityAboutMissionSection,
  SanityAboutPhilosophySection,
  SanityAboutCharterSection,
} from "@/lib/types";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";

interface MissionPhilosophyProps {
  ourMissionSection: SanityAboutMissionSection;
  ourPhilosophySection: SanityAboutPhilosophySection;
  ourCharterSection: SanityAboutCharterSection;
}

export default function MissionPhilosophy({
  ourMissionSection,
  ourPhilosophySection,
  ourCharterSection,
}: MissionPhilosophyProps) {
  // Create sections array from Sanity data
  const sections = [
    {
      heading: ourMissionSection.ourMissionHeading,
      content: ourMissionSection.ourMissionParagraph,
      image: ourMissionSection.ourMissionImage,
      type: "mission",
    },
    {
      heading: ourPhilosophySection.ourPhilosophyHeading,
      content: ourPhilosophySection.ourPhilosophyParagraph,
      image: ourPhilosophySection.ourPhilosophyImage,
      type: "philosophy",
    },
    {
      heading: ourCharterSection.ourCharterHeading,
      content: ourCharterSection.ourCharterParagraph,
      principles: ourCharterSection.charterPrinciples,
      type: "charter",
    },
  ];

  return (
    <div className="my-20">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`${
            index % 2 === 0
              ? "flex flex-col md:flex-row"
              : "flex flex-col md:flex-row-reverse"
          } gap-8 items-center mb-16`}
        >
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-[#2F4858]">
              {section.heading}
            </h2>
            <div className="w-20 h-1 bg-[#548281]"></div>
            <p className="text-lg text-gray-700 mt-4">{section.content}</p>
          </div>

          <div className="md:w-1/2">
            {section.type === "charter" && section.principles ? (
              <CharterSection
                charterPoints={section.principles.map((p) => p.title)}
              />
            ) : (
              <div className="p-8 flex items-center justify-center min-h-[300px]">
                {hasSanityImage(section.image) ? (
                  <Image
                    src={section.image}
                    alt={section.heading}
                    width={450}
                    height={300}
                    className="rounded-xl shadow-md"
                  />
                ) : (
                  <Image
                    src="/placeholder.svg?height=500&width=500"
                    alt={section.heading}
                    width={450}
                    height={300}
                    className="rounded-xl shadow-md"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
