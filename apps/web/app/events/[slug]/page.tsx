import EventActions from "@/components/events/event-actions";
import { Button } from "@/components/ui/button";
import { getConferenceBySlug } from "@/lib/sanity/queries";
import { SanityConference } from "@/lib/types";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventPageProps {
  params: {
    slug: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event: SanityConference = await getConferenceBySlug(params.slug);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl text-gray-600">Event not found</h1>
      </div>
    );
  }

  const eventDate = new Date(event.date + "T00:00:00");

  return (
    <section className="min-h-screen bg-gray-50">
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
      <div className="lg:container mx-auto px-4 md:px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
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

              <div className="flex items-center gap-6 text-gray-600 text-sm mb-6">
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
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                <div
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: event.about || event.description || "",
                  }}
                />
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

              {event.registrationLink ? (
                <Link href={event.registrationLink}>
                  <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white mb-4">
                    Register Now
                  </Button>
                </Link>
              ) : (
                <Button className="w-full bg-[#d03c37] hover:bg-[#b83531] text-white mb-4">
                  Register Now
                </Button>
              )}

              <EventActions event={event} />
            </div>

            {/* Organizer Info */}
            {event.organizer?.name && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Organizer</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
                    {event.organizer.logo?.asset?.url ? (
                      <Image
                        src={event.organizer.logo.asset.url}
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
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Related Campaign
                </h2>
                <Link
                  href={`/campaigns/${event.relatedCampaign.slug.current}`}
                  className="text-[#548281] hover:text-[#2F4858]"
                >
                  {event.relatedCampaign.title}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
