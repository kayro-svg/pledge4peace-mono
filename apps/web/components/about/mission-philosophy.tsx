import Image from "next/image";
import CharterSection from "@/components/about/charter-section";
import { AboutSection } from "@/lib/types";

interface MissionPhilosophyProps {
  sections: AboutSection[];
  hasCharterPoints: boolean;
  charterPoints: string[];
}

export default function MissionPhilosophy({
  sections,
  hasCharterPoints,
  charterPoints,
}: MissionPhilosophyProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-16 my-20">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`${
            index % 2 === 0
              ? "flex flex-col md:flex-row"
              : "flex flex-col md:flex-row-reverse"
          } gap-8 items-center`}
        >
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-[#2F4858]">
              {section.heading}
            </h2>
            <div className="w-20 h-1 bg-[#548281]"></div>
            <p className="text-lg text-gray-700 mt-4">{section.content}</p>
          </div>

          <div className="md:w-1/2">
            {section.heading === "Our Charter" &&
            hasCharterPoints &&
            charterPoints.length > 0 ? (
              <CharterSection charterPoints={charterPoints} />
            ) : (
              <div className="p-8 flex items-center justify-center min-h-[300px]">
                <Image
                  src={`/images/section-${index + 1}.jpg`}
                  alt={section.heading}
                  width={450}
                  height={300}
                  className="rounded-xl shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
