"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SanityHeroSection } from "@/lib/types";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function HeroButtons({ data }: { data: SanityHeroSection }) {
  const router = useRouter();
  const { session, isAuthenticated } = useAuthSession();

  const handleClick = () => {
    const el = document.getElementById("projects-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
      <Button
        className="bg-[#548281] text-white group w-full sm:w-auto text-lg sm:text-base px-4 py-2 h-auto"
        onClick={() => {
          if (isAuthenticated) {
            handleClick();
          } else {
            router.push("/login");
          }
        }}
      >
        {data.heroPrimaryButtonText}
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      <Button
        variant="outline"
        className="border-[#548281] hover:bg-[#2F4858] hover:text-white text-[#548281] w-full sm:w-auto text-lg sm:text-base px-4 py-2 h-auto"
        onClick={() => router.push("/about")}
      >
        {data.heroSecondaryButtonText}
      </Button>
    </div>
  );
}
