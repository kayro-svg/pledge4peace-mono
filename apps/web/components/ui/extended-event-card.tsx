import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface ExtendedEventCardProps {
  id: string;
  title: string;
  startDateTime?: string; // Optional for backward compatibility
  endDateTime?: string;
  timezone?: string; // Optional for backward compatibility
  description: string;
  location?: string;
  imageUrl: string;
  slug: string;
}

export default function ExtendedEventCard({
  id,
  title,
  startDateTime,
  endDateTime,
  timezone,
  description,
  location,
  imageUrl,
  slug,
}: ExtendedEventCardProps) {
  // Debug logging
  logger.log("ExtendedEventCard data:", {
    title,
    startDateTime,
    endDateTime,
    timezone,
  });

  // Parse datetime - treat Sanity format as local time in event timezone
  const parseEventDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return null;

    // Handle Sanity format like "2025-08-23 08:00" - this is LOCAL time in the event timezone
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      const [datePart, timePart] = dateTimeString.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      // Create a date representing this local time
      // We'll format it correctly with timezone later
      return {
        year,
        month,
        day,
        hours,
        minutes,
        isLocalTime: true,
        originalString: dateTimeString,
      };
    }

    // Handle ISO format - convert to date object
    if (dateTimeString.includes("T")) {
      const date = new Date(dateTimeString);
      return isNaN(date.getTime())
        ? null
        : {
            date,
            isLocalTime: false,
            originalString: dateTimeString,
          };
    }

    return null;
  };

  // Parse the datetime
  const isValidDateTime =
    startDateTime && startDateTime !== "undefined" && startDateTime !== "null";
  const parsedDateTime = isValidDateTime
    ? parseEventDateTime(startDateTime)
    : null;

  logger.log("Date parsing result:", {
    isValidDateTime,
    originalString: startDateTime,
    parsedDateTime,
    timezone,
  });

  // Format the parsed datetime for display
  const formatEventDateTime = () => {
    if (!parsedDateTime) {
      return {
        dayNumber: "TBD",
        monthShort: "TBD",
        displayDate: "Date TBD",
        displayTime: "Time TBD",
      };
    }

    // Handle local time format from Sanity (e.g., "2025-08-23 08:00")
    if (
      parsedDateTime.isLocalTime &&
      parsedDateTime.year &&
      parsedDateTime.month &&
      parsedDateTime.day &&
      parsedDateTime.hours !== undefined &&
      parsedDateTime.minutes !== undefined
    ) {
      const { year, month, day, hours, minutes } = parsedDateTime;

      // Create a date object for formatting
      const tempDate = new Date(year, month - 1, day, hours, minutes);

      // Format day and month
      const dayNumber = day.toString();
      const monthShort = tempDate.toLocaleDateString("en-US", {
        month: "short",
      });

      // Format time
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      const displayTime = `${displayHours}:${displayMinutes} ${period}`;

      // Get timezone abbreviation if available
      let timezoneDisplay = "";
      if (timezone) {
        try {
          const tzFormat = new Intl.DateTimeFormat("en-US", {
            timeZoneName: "short",
            timeZone: timezone,
          });
          timezoneDisplay =
            tzFormat
              .formatToParts(tempDate)
              .find((part) => part.type === "timeZoneName")?.value || "";
        } catch (error) {
          logger.error("Timezone formatting error:", error);
        }
      }

      return {
        dayNumber,
        monthShort,
        displayDate: `${monthShort} ${dayNumber}`,
        displayTime: timezoneDisplay
          ? `${displayTime} ${timezoneDisplay}`
          : displayTime,
      };
    }

    // Handle ISO format dates
    if (parsedDateTime.date) {
      const date = parsedDateTime.date;

      try {
        const options = timezone ? { timeZone: timezone } : {};

        const dayNumber = date.toLocaleDateString("en-US", {
          ...options,
          day: "numeric",
        });

        const monthShort = date.toLocaleDateString("en-US", {
          ...options,
          month: "short",
        });

        const displayTime = date.toLocaleTimeString("en-US", {
          ...options,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return {
          dayNumber,
          monthShort,
          displayDate: `${monthShort} ${dayNumber}`,
          displayTime,
        };
      } catch (error) {
        logger.error("Date formatting error:", error);
      }
    }

    // Fallback
    return {
      dayNumber: "TBD",
      monthShort: "TBD",
      displayDate: "Date TBD",
      displayTime: "Time TBD",
    };
  };

  const { dayNumber, monthShort, displayDate, displayTime } =
    formatEventDateTime();

  return (
    <article
      key={id}
      className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8"
    >
      {/* Date Column */}
      <div className="w-full md:w-fit lg:w-32 flex-shrink-0 hidden md:block">
        <div className="text-center md:text-left">
          <div className="text-4xl font-bold text-gray-900">{dayNumber}</div>
          <div className="text-lg text-gray-600 uppercase">{monthShort}</div>
        </div>
      </div>

      {/* Image Column */}
      <div className="relative w-full md:w-72 lg:w-96 h-48 flex-shrink-0">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Content Column */}
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          <Link
            href={`/events/${slug}`}
            className="hover:text-[#548281] transition-colors"
          >
            {title}
          </Link>
        </h3>

        <div className="flex items-center gap-6 text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-2 md:hidden">
            <CalendarDays className="w-4 h-4" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{displayTime}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors"
        >
          View Event Details
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </article>
  );
}
