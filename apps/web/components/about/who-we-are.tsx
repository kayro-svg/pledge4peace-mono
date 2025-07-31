import Image from "next/image";
import { SanityAboutWhoWeAreSection } from "@/lib/types";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";

interface WhoWeAreProps {
  whoWeAreSection: SanityAboutWhoWeAreSection;
}

export default function WhoWeAre({ whoWeAreSection }: WhoWeAreProps) {
  return (
    <section className="container mx-auto px-4 max-w-6xl py-4 md:py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858]">
          {whoWeAreSection.whoWeAreHeading}
        </h2>
      </div>
      {/* Intro Paragraphs */}
      <div className="flex flex-col gap-8">
        {whoWeAreSection.whoWeAreFirstParagraph && (
          <p className="text-lg text-gray-700">
            {whoWeAreSection.whoWeAreFirstParagraph}
          </p>
        )}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/2">
            <div className="relative rounded-3xl w-full h-[300px] md:h-[350px] lg:h-[450px] overflow-hidden shadow-lg">
              {hasSanityImage(whoWeAreSection.whoWeAreImage) ? (
                <Image
                  src={whoWeAreSection.whoWeAreImage}
                  alt="About Pledge4Peace"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="About Pledge4Peace"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            {whoWeAreSection.whoWeAreSecondParagraph && (
              <p className="text-lg text-gray-700">
                {whoWeAreSection.whoWeAreSecondParagraph}
              </p>
            )}
          </div>
        </div>
        {whoWeAreSection.whoWeAreThirdParagraph && (
          <p className="text-lg text-gray-700">
            {whoWeAreSection.whoWeAreThirdParagraph}
          </p>
        )}
      </div>
    </section>
  );
}
