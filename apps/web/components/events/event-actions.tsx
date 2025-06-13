"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { SanityConference } from "@/lib/types";
import { ShareSocialButton } from "../campaign/ways-to-support/share/share-social-button";

interface EventActionsProps {
  event: SanityConference;
}

export default function EventActions({ event }: EventActionsProps) {
  const handleAddToCalendar = () => {
    if (!event.startDateTime) {
      alert("Event date is not available");
      return;
    }

    // Parse the start date time (already in UTC)
    const startDate = new Date(event.startDateTime);

    // Use end date time if available, otherwise default to 1 hour later
    const endDate = event.endDateTime
      ? new Date(event.endDateTime)
      : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ format)
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const googleCalendarUrl = new URL(
      "https://calendar.google.com/calendar/render"
    );
    googleCalendarUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarUrl.searchParams.append("text", event.title);
    googleCalendarUrl.searchParams.append(
      "dates",
      `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`
    );

    if (event.location) {
      googleCalendarUrl.searchParams.append("location", event.location);
    }

    if (event.description) {
      googleCalendarUrl.searchParams.append("details", event.description);
    }

    if (typeof window !== "undefined") {
      window.open(googleCalendarUrl.toString(), "_blank");
    }
  };

  return (
    <div className="flex gap-2 flex-row md:flex-col lg:flex-row">
      <Button
        variant="outline"
        className="flex-1 inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#548281] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
        onClick={handleAddToCalendar}
      >
        <CalendarDays className="w-4 h-4 mr-2" />
        Calendar
      </Button>
      <ShareSocialButton
        shareData={{
          url: typeof window !== "undefined" ? window.location.href : "",
          text: `Check out this event: ${event.title}`,
          title: event.title,
        }}
        className="flex-1"
      />
    </div>
  );
}
