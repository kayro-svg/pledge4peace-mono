"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePledges } from "@/hooks/usePledges";
import { prefetchCampaign } from "@/lib/sanity/prefetch";
import { useCallback } from "react";
import { logger } from "@/lib/utils/logger";

interface CampaignCardProps {
  title: string;
  description: string;
  featuredImage: string;
  raised?: number;
  goal?: number;
  category: string;
  action: string;
  variant?: "default" | "horizontal" | "compact" | "horizontal-large";
  link: string;
  campaignId?: string;
}

export default function CampaignCard({
  title,
  description,
  featuredImage,
  goal = 10000,
  category,
  action,
  variant = "default",
  link,
  campaignId,
}: CampaignCardProps) {
  const { pledgeCount } = usePledges(campaignId);

  const progress = Math.round((pledgeCount / goal) * 100);
  const router = useRouter();

  // Handle mouse enter to prefetch campaign data - only do this if we have a valid link
  const handleMouseEnter = useCallback(() => {
    if (link) {
      logger.log(`[CampaignCard] Prefetching data for campaign: ${link}`);
      prefetchCampaign(link);
    }
  }, [link]);

  // Navigate to campaign page with proper error handling
  const navigateToCampaign = useCallback(() => {
    if (!link) {
      logger.error("[CampaignCard] Cannot navigate - missing campaign slug");
      return;
    }

    logger.log(`[CampaignCard] Navigating to campaign: ${link}`);
    // Ensure we're using the correct URL format
    router.push(`/campaigns/${link}`);
  }, [router, link]);

  if (variant === "horizontal") {
    return (
      <Card className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
        <div
          className="relative h-48 md:h-auto w-full md:w-[40%] cursor-pointer"
          onClick={navigateToCampaign}
        >
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            fill
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col p-3 sm:p-4 w-full md:w-[60%] h-full justify-between">
          <div className="mb-2 flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm"
            >
              {category}
            </Badge>
            <span className="text-xs sm:text-sm font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <h3
            className="mb-1 line-clamp-1 text-sm sm:text-base font-semibold cursor-pointer"
            onClick={navigateToCampaign}
          >
            {title}
          </h3>
          <p className="mb-2 sm:mb-3 line-clamp-2 text-xs text-slate-500">
            {description}
          </p>
          <div className="flex flex-col justify-between text-xs sm:text-sm">
            <Progress value={progress} className="h-1.5 sm:h-2 mb-1 sm:mb-2" />
            <div className="flex items-center justify-between">
              <span className="font-medium">
                +{pledgeCount.toLocaleString()} Peace Pledges
              </span>
              <span className="text-slate-500 text-xs">
                +{goal.toLocaleString()} Peace Pledges
              </span>
            </div>
          </div>
          <Button
            className="bg-[#548281] text-white py-1.5 sm:py-2 px-4 sm:px-6 mt-3 sm:mt-4 rounded-full text-xs sm:text-sm font-medium hover:bg-[#2f4858] transition-colors w-full"
            onClick={navigateToCampaign}
          >
            {action}
          </Button>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className="overflow-hidden rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md h-full"
        onMouseEnter={handleMouseEnter}
      >
        <div
          className="aspect-[4/3] w-full overflow-hidden cursor-pointer"
          onClick={navigateToCampaign}
        >
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs"
            >
              {category}
            </Badge>
            <span className="text-[10px] sm:text-xs font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <CardTitle
            className="line-clamp-1 text-xs sm:text-sm mt-1 cursor-pointer"
            onClick={navigateToCampaign}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-0">
          <Progress value={progress} className="h-1 sm:h-1.5 mb-1 sm:mb-2" />
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="font-medium">+{pledgeCount.toLocaleString()}</span>
            <span className="text-slate-500">+{goal.toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter className="p-2 sm:p-3 pt-0">
          <Button
            size="sm"
            className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-[10px] sm:text-xs rounded-full py-1 sm:py-1.5"
            onClick={navigateToCampaign}
          >
            {action}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (variant === "horizontal-large") {
    return (
      <Card className="overflow-hidden max-w-7xl rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
        <div
          className="aspect-video w-full md:w-[50%] overflow-hidden cursor-pointer"
          onClick={navigateToCampaign}
        >
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            width={400}
            height={200}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="flex flex-col p-3 sm:p-4 w-full md:w-[50%] h-full justify-between">
          <div className="flex items-center justify-between px-2 sm:px-4">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 text-base"
            >
              {category}
            </Badge>
            <span className="text-base font-medium text-emerald-700">
              {progress}%
            </span>
          </div>
          <CardHeader className="p-2 sm:p-4 pb-4 sm:pb-6 md:pb-8">
            <CardTitle
              className="text-xl sm:text-xl md:text-2xl font-bold cursor-pointer"
              onClick={navigateToCampaign}
            >
              {title}
            </CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pb-4 sm:pb-6 md:pb-8">
            <Progress value={progress} className="h-1.5 sm:h-2" />
            <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium">
                +{pledgeCount.toLocaleString()} Peace Pledge
                {pledgeCount !== 1 ? "s" : ""}
              </span>
              <span className="text-slate-500 text-xs sm:text-sm">
                +{goal.toLocaleString()} Peace Pledge{goal !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
          <div className="flex px-2 sm:px-4">
            <Button
              className="bg-[#548281] text-white py-1.5 sm:py-2 px-4 sm:px-6 mt-2 sm:mt-4 rounded-full text-base font-medium hover:bg-[#2f4858] transition-colors w-full"
              onClick={navigateToCampaign}
            >
              {action}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className="flex-1 overflow-hidden max-w-xl rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md"
      onMouseEnter={handleMouseEnter}
    >
      <div
        className="aspect-video w-full overflow-hidden cursor-pointer"
        onClick={navigateToCampaign}
      >
        <Image
          src={featuredImage || "/placeholder.svg"}
          alt={title}
          width={400}
          height={200}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-3 sm:p-4 md:p-4 pb-4 sm:pb-6 md:pb-4">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm"
          >
            {category}
          </Badge>
          <span className="text-xs sm:text-sm font-medium text-emerald-700">
            {progress}%
          </span>
        </div>
        <CardTitle
          className="line-clamp-2 text-lg sm:text-xl md:text-2xl mt-2 cursor-pointer"
          onClick={navigateToCampaign}
        >
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm md:text-md mt-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-4 pb-4 sm:pb-4 md:pb-4">
        <Progress value={progress} className="h-1.5 sm:h-2" />
        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-left">
            +{pledgeCount.toLocaleString()} Peace Pledges
          </span>
          <span className="text-slate-500 text-xs sm:text-sm text-right">
            +{goal.toLocaleString()} Peace Pledges
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 md:p-4">
        <Button
          className="w-full bg-[#548281] hover:bg-[#2f4858] text-white text-xs sm:text-sm md:text-md font-medium sm:font-semibold rounded-full py-1.5 sm:py-2 md:py-3"
          onClick={navigateToCampaign}
        >
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
}
