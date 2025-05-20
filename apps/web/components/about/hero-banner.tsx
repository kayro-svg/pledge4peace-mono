import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  content: string;
}

export default function HeroBanner({ title, content }: HeroBannerProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Modern gradient background with curved bottom edge */}
      <div className="bg-gradient-to-br from-[#2F4858] via-[#548281] to-[#8BB05C] py-24 px-8 text-white relative">
        {/* <div className="absolute inset-0 bg-black/30 z-0"></div> */}

        {/* Optional: Add a background image */}
        {/* <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/peace-background.jpg"
            alt="Peace background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div> */}

        <div className="container mx-auto max-w-6xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            {title}
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl text-white/90 mb-8">
            {content}
          </p>

          <Button
            className="bg-white text-[#548281] hover:bg-white/90 hover:text-[#2F4858] group rounded-full"
            size="lg"
          >
            Make a Pledge
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Curved edge at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#FDFDF0] rounded-t-[50%] z-10"></div>
      </div>
    </div>
  );
}
