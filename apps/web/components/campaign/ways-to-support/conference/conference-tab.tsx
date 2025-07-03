"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  CheckCircle,
  LogIn,
  Loader2,
} from "lucide-react";
import { SanityConference } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { toast } from "sonner";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/ui/portable-text-components";
import {
  registerToEvent,
  handleRegistrationError,
  getEventRegistrationStatus,
} from "@/lib/api/brevo";
import { cleanTimezone } from "@/lib/utils/clean-timezone";

interface ConferenceTabProps {
  conferenceRef:
    | SanityConference
    | { _ref: string; _type: "reference" }
    | undefined;
}

// Helper function to format conference time with timezone
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
  //   debugTimezone(event.timezone, "conference-tab.tsx");
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

export default function ConferenceTab({ conferenceRef }: ConferenceTabProps) {
  const conference = conferenceRef as SanityConference;
  const timeInfo = formatConferenceDateTime(conference);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { session, isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (!session) return;
    const checkRegistrationStatus = async () => {
      const data = await getEventRegistrationStatus(conference._id);
      setIsRegistered(data.isRegistered);
    };
    checkRegistrationStatus();
  }, [conference._id, session]);

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

  const handleRegisterNow = async () => {
    setIsLoading(true);
    try {
      const data = await registerToEvent({
        eventId: conference._id,
        eventTitle: conference.title,
      });

      setIsRegistered(data.brevoRegistered);
      if (data.brevoRegistered) {
        toast.success(`Successfully registered to "${conference.title}"!`);
      } else {
        toast.error(
          "There was an error registering to the event, please try again later."
        );
      }
    } catch (error) {
      handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

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

              {isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      You&apos;re registered!
                    </p>
                  </div>
                </div>
              ) : session ? (
                <Button
                  onClick={handleRegisterNow}
                  className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Register Now"
                  )}
                </Button>
              ) : (
                <Link href="/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#d03c37] text-[#d03c37] hover:bg-[#d03c37] hover:text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to Register
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none text-gray-600 mt-6">
            {conference.about && Array.isArray(conference.about) ? (
              <PortableText
                value={conference.about}
                components={portableTextComponents}
              />
            ) : (
              <p>{conference.description}</p>
            )}
          </div>
        </div>

        {/* Speakers */}
        {conference.speakers && conference.speakers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Speakers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conference.speakers.map((speaker) => (
                <div key={speaker._id} className="flex items-center gap-3">
                  {speaker.image?.asset?.url && (
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      <Image
                        src={speaker.image.asset.url}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{speaker.name}</h4>
                    {speaker.role && (
                      <p className="text-sm text-gray-600">{speaker.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
