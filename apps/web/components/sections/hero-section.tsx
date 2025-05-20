"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChartNoAxesCombined,
  HeartHandshake,
  Landmark,
  HandHeart,
} from "lucide-react";
import HeroVideo from "../ui/hero-video";
import { useAnimatedNumber } from "@/lib/hooks/useAnimatedNumbers";
import { StatCard } from "@/components/ui/stat-card";

export default function HeroSection() {
  const router = useRouter();
  const stats = [
    {
      icon: <ChartNoAxesCombined className="text-[#2F4858]" />,
      value: "100,000",
      label: "Pledges Made",
      type: "pledgesMade",
    },
    {
      icon: <HeartHandshake className="text-[#2F4858]" />,
      value: "5000",
      label: "Peace activists",
      type: "peaceActivists",
    },
    {
      icon: <HandHeart className="text-[#2F4858]" />,
      value: "100",
      label: "Donors",
      type: "donors",
    },
  ];

  const counts = stats.map((stat) =>
    useAnimatedNumber(parseInt(stat.value.replace(/,/g, "")))
  );
  // Format the number with commas
  const formattedCount = counts.map((count) => count.toLocaleString());
  return (
    <section className="flex flex-row w-full h-fit overflow-hidden items-start px-8 pr-0 py-16 gap-4">
      <div className="flex flex-col gap-8 w-[45%]">
        <div className="mx-auto h-full flex flex-col">
          <div className="inline-block w-fit px-4 mb-6 bg-[#86AC9D] backdrop-blur-sm text-[#2F4858] bg-opacity-25 rounded-full text-sm font-medium ">
            Building Peace Together
          </div>
          <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4 text-[#2F4858]">
            To Solve The World's Problems,{" "}
            <span className="text-[#548281]">One Pledge At A Time.</span>
          </h1>
          <p className="text-1xl md:text-xl mt-4 mb-8 text-[#2F4858] max-w-xl">
            In the earth of hope, where dreams take flight,{" "}
            <span className="text-[#548281]">Pledge4Peace</span> stands, a
            beacon bright.
            <br /> Where hearts unite and visions align, to solve the worlds
            problems one Pledge at a time.
          </p>

          <div className="flex flex-row gap-4">
            <Button
              className="bg-[#548281] text-white group"
              onClick={() => router.push("/login")}
            >
              Pledge Now
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="border-[#548281] hover:bg-[#2F4858] hover:text-white text-[#548281]"
              onClick={() => router.push("/about")}
            >
              Learn About Us
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 max-w-xl">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.type}
              icon={stat.icon}
              count={formattedCount[index]}
              label={stat.label}
            />
          ))}
        </div>
      </div>

      <div className="relative mr-[-50px] w-[55%] right-0">
        <HeroVideo />
      </div>
    </section>
  );
}
