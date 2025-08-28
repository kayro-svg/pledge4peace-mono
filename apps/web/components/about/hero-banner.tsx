import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SanityAboutHeroSection } from "@/lib/types";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

interface HeroBannerProps {
  heroSection: SanityAboutHeroSection;
  noButton?: boolean;
  fullWidth?: boolean;
  bgImage?: string;
  height?: string;
  textCenter?: boolean;
  dropShadow?: boolean;
}

export default function HeroBanner({
  heroSection,
  noButton = false,
  fullWidth = false,
  bgImage,
  height,
  textCenter = false,
  dropShadow = false,
}: HeroBannerProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Modern gradient background with curved bottom edge */}
      <div
        className={`bg-gradient-to-br from-[#2F4858] via-[#548281] to-[#8BB05C] py-16 md:py-24 px-2 md:px-4 lg:px-8 text-white relative ${height ? height : ""} ${textCenter ? "flex flex-col items-center justify-center" : "items-start justify-start"}`}
      >
        {/* Background image from Sanity */}
        {bgImage && (
          <div className="absolute inset-0 z-0 opacity-10">
            <Image
              src={getSanityImageUrl(bgImage, 1920, 1080, 70)}
              alt="About Us Hero Background"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}

        <div
          className={`container mx-auto ${fullWidth ? "max-w-full" : "max-w-6xl"} relative z-10 ${textCenter ? "flex flex-col items-center justify-center" : "items-start justify-start"}`}
        >
          <h1
            className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-white ${dropShadow ? "drop-shadow-lg" : ""}`}
          >
            {heroSection?.heroHeading}
          </h1>

          <p
            className={`text-lg md:text-xl lg:text-2xl max-w-3xl text-white mb-8 ${dropShadow ? "drop-shadow-lg" : ""}`}
          >
            {heroSection?.heroSubheading}
          </p>

          {!noButton && (
            <Button
              className="bg-white text-[#548281] hover:bg-white/90 hover:text-[#2F4858] group rounded-full"
              size="lg"
            >
              Make a Pledge
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>

        {/* Curved edge at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#FDFDF0] rounded-t-[50%] z-1"></div>
      </div>
    </div>
  );
}
