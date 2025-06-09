import EventPageContent from "@/components/events/event-page-content";
import { getConferenceBySlug } from "@/lib/sanity/queries";
import { SanityConference } from "@/lib/types";

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

  return <EventPageContent event={event} />;
}
