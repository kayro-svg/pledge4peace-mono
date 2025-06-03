"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { SanityConference } from "@/lib/types";

interface ConferenceTabProps {
  conferenceRef:
    | SanityConference
    | { _ref: string; _type: "reference" }
    | undefined;
}

export default function ConferenceTab({ conferenceRef }: ConferenceTabProps) {
  if (!conferenceRef) {
    return (
      <div className="p-6 text-center">No conference information available</div>
    );
  }

  // If it's a reference type, we know it's not the full conference data
  if ("_type" in conferenceRef && conferenceRef._type === "reference") {
    return (
      <div className="p-6 text-center">Loading conference information...</div>
    );
  }

  const conference = conferenceRef as SanityConference;
  const eventDate = conference.date
    ? new Date(conference.date + "T00:00:00")
    : null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Section */}
      <div className="relative w-full h-[200px] rounded-xl overflow-hidden">
        {conference.image?.asset?.url && (
          <Image
            src={conference.image.asset.url}
            alt={conference.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header Info */}
        <div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {conference.category || "Virtual"}
                </span>
                {conference.organizer?.name && (
                  <span>By {conference.organizer.name}</span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {conference.title}
              </h2>

              {/* Date and Location */}
              <div className="flex items-center gap-6 text-gray-600 text-sm mb-4">
                {eventDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div>
                        {eventDate.toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {conference.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{conference.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-4 space-y-4 w-full md:w-1/3 h-fit border border-gray-200 rounded-xl shadow-md p-4">
              <div className="text-xl font-bold text-gray-900">
                {conference.price === 0 || !conference.price
                  ? "Free Event"
                  : `$${conference.price}`}
              </div>

              {conference.registrationLink ? (
                <Link href={conference.registrationLink} className="w-full">
                  <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white">
                    Register Now
                  </Button>
                </Link>
              ) : (
                <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white">
                  Register Now
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none text-gray-600 mt-6">
            <div
              dangerouslySetInnerHTML={{
                __html: conference.about || conference.description || "",
              }}
            />
          </div>
        </div>

        {/* Gallery - Compact Version */}
        {conference.gallery && conference.gallery.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {conference.gallery.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={image.url}
                  alt={`Event image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Registration Section */}
        {/* <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
          <div className="text-xl font-bold text-gray-900">
            {conference.price === 0 || !conference.price
              ? "Free Event"
              : `$${conference.price}`}
          </div>

          {conference.registrationLink ? (
            <Link href={conference.registrationLink} className="w-full">
              <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white">
                Register Now
              </Button>
            </Link>
          ) : (
            <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white">
              Register Now
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}
