"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays, Share2 } from "lucide-react";
import { SanityConference } from "@/lib/types";
import { ShareSocialButton } from "../campaign/ways-to-support/share/share-social-button";

interface EventActionsProps {
  event: SanityConference;
}

export default function EventActions({ event }: EventActionsProps) {
  const handleAddToCalendar = () => {
    const eventDate = new Date(event.date + "T00:00:00");
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hora después

    const googleCalendarUrl = new URL(
      "https://calendar.google.com/calendar/render"
    );
    googleCalendarUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarUrl.searchParams.append("text", event.title);
    googleCalendarUrl.searchParams.append(
      "dates",
      `${eventDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
    );
    if (event.location) {
      googleCalendarUrl.searchParams.append("location", event.location);
    }

    window.open(googleCalendarUrl.toString(), "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
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
          url: window.location.href,
          text: `Check out this event: ${event.title}`,
          title: event.title,
        }}
        className="flex-1"
      />
    </div>
  );
}
