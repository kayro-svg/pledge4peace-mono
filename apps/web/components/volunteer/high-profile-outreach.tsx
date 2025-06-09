import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { SanityVolunteerConvinceHighProfileSection } from "@/lib/types";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";

interface HighProfileOutreachProps {
  convinceHighProfileSection: SanityVolunteerConvinceHighProfileSection;
}

export default function HighProfileOutreach({
  convinceHighProfileSection,
}: HighProfileOutreachProps) {
  return (
    <section className="py-16 px-4 bg-white" id="high-profile">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-6">
              {convinceHighProfileSection.convinceHighProfileHeading}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {convinceHighProfileSection.convinceHighProfileParagraph}
            </p>
            <ul className="space-y-3">
              {convinceHighProfileSection.convinceHighProfileChecklist.map(
                (item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                    <span>{item.title}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="md:w-1/2 relative h-[300px] w-full">
            {hasSanityImage(
              convinceHighProfileSection.convinceHighProfileImage
            ) ? (
              <Image
                src={getSanityImageUrl(
                  convinceHighProfileSection.convinceHighProfileImage,
                  600,
                  400
                )}
                alt="Influential figures supporting peace"
                className="rounded-lg object-cover"
                fill
              />
            ) : (
              <Image
                src="/placeholder.svg?height=400&width=600&text=Influential+Figures"
                alt="Influential figures supporting peace"
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
