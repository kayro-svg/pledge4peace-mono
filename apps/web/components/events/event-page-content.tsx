"use client";

import EventActions from "./event-actions";
import { Button } from "@/components/ui/button";
import { SanityConference } from "@/lib/types";
import { CalendarDays, MapPin, CheckCircle, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  registerToEvent,
  showRegistrationSuccess,
  handleRegistrationError,
  getEventRegistrationStatus,
} from "@/lib/api/brevo";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/ui/portable-text-components";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import { cleanTimezone } from "@/lib/utils/clean-timezone";

// Helper function to format conference time with timezone - FIXED VERSION
const formatConferenceDateTime = (event: SanityConference) => {
  if (!event.startDateTime) {
    return {
      date: null,
      formattedDate: "Date TBD",
      formattedTime: null,
      timezone: null,
    };
  }

  // 🧹 Limpiar timezone corrupto ANTES de usarlo
  const cleanedTimezone = cleanTimezone(event.timezone);

  // Debug del timezone original si está corrupto
  // if (event.timezone && event.timezone.length > 50) {
  //   debugTimezone(event.timezone, "event-page-content.tsx");
  // }

  // Parse the UTC datetime string
  const startDateTime = new Date(event.startDateTime);
  const endDateTime = event.endDateTime ? new Date(event.endDateTime) : null;

  // Format date using the CLEANED timezone
  const formattedDate = startDateTime.toLocaleDateString("en-US", {
    timeZone: cleanedTimezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Format time - convert UTC to the CLEANED timezone
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: cleanedTimezone,
  };

  const startTimeFormatted = startDateTime.toLocaleTimeString(
    "en-US",
    formatOptions
  );
  const endTimeFormatted = endDateTime
    ? endDateTime.toLocaleTimeString("en-US", formatOptions)
    : null;

  logger.log("⏰ Formatted time result:", startTimeFormatted);

  // Get timezone abbreviation using CLEANED timezone
  const timezoneDisplayName = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
    timeZone: cleanedTimezone,
  })
    .formatToParts(startDateTime)
    .find((part) => part.type === "timeZoneName")?.value;

  return {
    date: startDateTime,
    formattedDate,
    formattedTime: endTimeFormatted
      ? `${startTimeFormatted} - ${endTimeFormatted}`
      : startTimeFormatted,
    timezone: timezoneDisplayName,
    startTime: startDateTime,
    endTime: endDateTime,
  };
};

export default function EventPageContent({
  event,
}: {
  event: SanityConference;
}) {
  const timeInfo = formatConferenceDateTime(event);
  const [isRegistered, setIsRegistered] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const handleRegisterNow = async () => {
    try {
      if (!session) {
        toast.error("Please sign in to register for this event.");
        router.push("/login");
        return;
      }

      const data = await registerToEvent({
        eventId: event._id,
        eventTitle: event.title,
      });
      setIsRegistered(data.brevoRegistered);
      toast.success(`Successfully registered to "${event.title}"!`);
    } catch (error) {
      logger.error(error);
      toast.error(
        "There was an error registering to the event, please try again later."
      );
    }
  };

  useEffect(() => {
    if (!session) return;
    const checkRegistrationStatus = async () => {
      const data = await getEventRegistrationStatus(event._id);
      logger.log(data);
      setIsRegistered(data.isRegistered);
    };
    checkRegistrationStatus();
  }, [event._id, session]);

  return (
    <section className="min-h-screen pb-10">
      {/* Header with Image */}
      <div className="relative w-full h-[300px] bg-gray-900">
        {event.image?.asset?.url && (
          <Image
            src={event.image.asset.url}
            alt={event.title}
            fill
            className="object-cover opacity-70"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
      </div>

      {/* Event Content */}
      <div className="lg:container mx-auto  px-2 md:px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {event.category || "Virtual"}
                </span>
                {event.organizer?.name && (
                  <span>By {event.organizer.name}</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 text-gray-600 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">
                      {timeInfo.formattedDate}
                    </div>
                    {timeInfo.formattedTime && (
                      <div className="flex items-center gap-2">
                        <span>{timeInfo.formattedTime}</span>
                        {timeInfo.timezone && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {timeInfo.timezone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                {event.about && Array.isArray(event.about) ? (
                  <div className="text-gray-600">
                    <PortableText
                      value={event.about}
                      components={portableTextComponents}
                    />
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>{event.description}</p>
                  </div>
                )}
              </div>

              {event.speakers && event.speakers.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Speakers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.speakers.map((speaker) => (
                      <div
                        key={speaker._id}
                        className="flex items-center gap-4"
                      >
                        {speaker.image?.asset?.url && (
                          <div className="w-16 h-16 relative rounded-full overflow-hidden">
                            <Image
                              src={speaker.image.asset.url}
                              alt={speaker.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{speaker.name}</h3>
                          {speaker.role && (
                            <p className="text-sm text-gray-600">
                              {speaker.role}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.gallery && event.gallery.length > 0 && (
                <div className="mt-8">
                  {/* <h2 className="text-xl font-semibold mb-4">Gallery</h2> */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.gallery.map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image
                          src={image.url}
                          alt={`Event image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                {event.price === 0 || !event.price ? "Free" : `$${event.price}`}
              </div>
              {isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      You&apos;re registered!
                    </p>
                    <p className="text-xs text-green-600">
                      You&apos;re all set for this event.
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleRegisterNow}
                  className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white mb-4"
                >
                  {session ? (
                    "Register Now"
                  ) : (
                    <div className="flex items-center gap-0">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in to register
                    </div>
                  )}
                </Button>
              )}
              <EventActions event={event} />
            </div>

            {/* Organizer Info */}
            {event.organizer?.name && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Organizer</h2>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-transparent rounded-full overflow-hidden relative flex items-center justify-center">
                    {event.organizer.logo ? (
                      <Image
                        src={event.organizer.logo}
                        alt={event.organizer.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg font-medium">
                        {event.organizer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{event.organizer.name}</div>
                  </div>
                </div>
              </div>
            )}

            {event.relatedCampaign && (
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Related Campaign
                  </h2>
                </div>
                <Link
                  href={`/campaigns/${event.relatedCampaign.slug}`}
                  className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#548281] transition-colors"
                >
                  <span className="text-gray-700 group-hover:text-[#548281] font-medium transition-colors">
                    {event.relatedCampaign.title}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-[#548281] group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
