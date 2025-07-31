import { Mail, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SanityVolunteerSpreadTheWordSection } from "@/lib/types";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";

interface SpreadWordSectionProps {
  spreadTheWordSection: SanityVolunteerSpreadTheWordSection;
}

export default function SpreadWordSection({
  spreadTheWordSection,
}: SpreadWordSectionProps) {
  // Icons for the cards (assigned by index)
  const cardIcons = [
    <Mail className="h-6 w-6 text-[#2F4858]" />,
    <Globe className="h-6 w-6 text-[#2F4858]" />,
  ];

  console.log("spreadTheWordSection", spreadTheWordSection);
  return (
    <section className="py-16 px-4 bg-[#FDFDF0]" id="spread-word">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 md:order-2">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-6">
              {spreadTheWordSection?.heading}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {spreadTheWordSection?.paragraph}
            </p>
            <div className="space-y-6">
              {spreadTheWordSection?.cards?.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-[#D6E0B6] p-2 rounded-lg mr-4">
                      {cardIcons[index] || cardIcons[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2F4858] text-2xl mb-2">
                        {card?.title}
                      </h3>
                      <p className="text-gray-600">{card?.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 md:order-1 relative h-[300px] w-full">
            {hasSanityImage(spreadTheWordSection?.image) ? (
              <Image
                src={spreadTheWordSection?.image}
                alt="Spreading the message of peace"
                className="rounded-lg object-cover"
                fill
              />
            ) : (
              <Image
                src="/placeholder.svg?height=400&width=600&text=Spreading+The+Message"
                alt="Spreading the message of peace"
                className="rounded-lg object-cover"
                fill
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
