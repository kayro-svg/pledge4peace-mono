"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getCampaignBySlug } from "@/lib/api";
import { CampaignWithSolutions } from "@/lib/types";

interface ConferenceTabProps {
  campaignSlug: string;
}

export default function ConferenceTab({ campaignSlug }: ConferenceTabProps) {
  const [campaign, setCampaign] = useState<CampaignWithSolutions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        setIsLoading(true);
        const campaignData = await getCampaignBySlug(campaignSlug);
        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaignData();
  }, [campaignSlug]);

  // Show loading state
  if (isLoading) {
    return <div className="p-6 text-center">Loading conference details...</div>;
  }

  // Show empty state if no campaign data or conference data
  if (!campaign || !campaign.conference) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Conference details not available.</p>
      </div>
    );
  }

  const { conference } = campaign;

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold">{conference.title}</h2>

      {/* Main conference banner with registration */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="w-full h-[500px] relative">
          <Image
            src={conference.images.banner}
            alt={`Conference banner for ${campaign.title}`}
            fill
            className="object-cover brightness-[0.8]"
          />

          {/* Registration popup overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[350px] z-10">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Reserve A Free Spot Today!
              </h3>
              <p className="text-gray-700 mb-6">
                Join us online on {conference.date}, at {conference.time}.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input placeholder="Email address" type="email" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input placeholder="Complete name" />
                </div>

                <Button className="w-full bg-[#3c6665] hover:bg-[#2a4847]">
                  Register
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About the conference section */}
      <div>
        <h3 className="text-2xl font-bold mb-4">About the conference</h3>
        <p className="text-gray-700 mb-4">{conference.about}</p>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-2 gap-4">
        {conference.images.gallery.map((image, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden h-[200px] relative"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="flex flex-col items-center justify-center text-center py-8">
        <h3 className="text-2xl font-bold uppercase mb-4">
          Let's make a change together
        </h3>
        <p className="text-gray-700 mb-6 max-w-2xl">
          Sign up today! And we'll send you the agenda and details on how to
          access the conference.
        </p>
        <Button className="bg-[#3c6665] hover:bg-[#2a4847] px-8">
          Register
        </Button>
      </div>
    </div>
  );
}
