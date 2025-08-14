// apps/web/app/[locale]/events/[slug]/page.tsx
import EventPageContent from "@/components/events/event-page-content";
import { getConferenceBySlug } from "@/lib/sanity/queries";
import { SanityConference } from "@/lib/types";
import { logger } from "@/lib/utils/logger";

interface Props {
  params: { locale: "en" | "es"; slug: string };
}

export const revalidate = 60; // ISR (opcional)

export default async function EventPage({ params }: Props) {
  const { locale, slug } = params;

  const event: SanityConference | null = await getConferenceBySlug(
    slug,
    locale
  );

  logger.log("Event page", { event });

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl text-gray-600">
          {locale === "es" ? "Evento no encontrado" : "Event not found"}
        </h1>
      </main>
    );
  }

  return <EventPageContent event={event} />;
}

// import EventPageContent from "@/components/events/event-page-content";
// import { getConferenceBySlug } from "@/lib/sanity/queries";
// import { SanityConference } from "@/lib/types";

// interface EventPageProps {
//   params: {
//     slug: string;
//   };
// }

// export default async function EventPage({ params }: EventPageProps) {
//   const event: SanityConference = await getConferenceBySlug(params.slug);

//   if (!event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <h1 className="text-2xl text-gray-600">Event not found</h1>
//       </div>
//     );
//   }

//   return <EventPageContent event={event} />;
// }
