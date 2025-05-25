"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SanityHeroSection } from "@/lib/types";

export default function HeroButtons({ data }: { data: SanityHeroSection }) {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4">
      <Button
        className="bg-[#548281] text-white group"
        onClick={() => router.push("/login")}
      >
        {data.heroPrimaryButtonText}
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      <Button
        variant="outline"
        className="border-[#548281] hover:bg-[#2F4858] hover:text-white text-[#548281]"
        onClick={() => router.push("/about")}
      >
        {data.heroSecondaryButtonText}
      </Button>
    </div>
  );
}
