"use client";

import CampaignCard from "@/components/ui/campaign-card";
import { SanityCampaign } from "@/lib/types";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

interface RecentActivityProps {
  campaignsPledged: SanityCampaign[];
  campaignsNotPledged: SanityCampaign[];
}

export function RecentActivity({
  campaignsPledged,
  campaignsNotPledged,
}: RecentActivityProps) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ">Your activity</h1>
          <p className="text-sm text-gray-500">
            Here are the latest campaigns based on your pledge history. Check
            their progress and explore more ways to support them.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignsPledged.length > 0 ? (
              campaignsPledged.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaignId={campaign._id}
                  featuredImage={campaign.featuredImage?.asset?.url as string}
                  title={campaign.title}
                  description={campaign.description}
                  action="View campaign"
                  link={campaign.slug.current}
                  // campaignType="your-activity"
                  variant="horizontal"
                  category={campaign.category || ""}
                  goal={campaign.goalPledges}
                />
              ))
            ) : (
              <div className="col-span-2 bg-slate-50 rounded-xl p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
                  <div className="relative w-40 h-40">
                    <Image
                      src="/images/no-results.svg"
                      alt="No activity yet"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">
                      You haven&apos;t pledged to any campaigns yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      Make your first pledge and join thousands of others
                      working towards peace.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      variant="default"
                      size="lg"
                      className="px-6"
                    >
                      <Link href="/campaigns">Explore campaigns</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/about">Learn more</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ">Recommended for you</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignsNotPledged.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaignId={campaign._id}
                featuredImage={campaign.featuredImage?.asset?.url as string}
                title={campaign.title}
                description={campaign.description}
                link={campaign.slug.current}
                variant="compact"
                category={campaign.category || ""}
                action="Pledge Now"
                goal={campaign.goalPledges}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
