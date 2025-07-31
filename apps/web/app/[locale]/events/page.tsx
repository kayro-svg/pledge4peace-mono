// apps/web/app/[locale]/events/page.tsx
import HeroBanner from "@/components/about/hero-banner";
import ExtendedEventCard from "@/components/ui/extended-event-card";
import { getConferences } from "@/lib/sanity/queries";

export const revalidate = 60; // ISR opcional

interface Props {
  params: { locale: "en" | "es" };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = params; // ← viene del segmento [locale]
  const events = await getConferences(locale);

  return (
    <main className="min-h-screen">
      <HeroBanner
        heroSection={{
          heroHeading:
            locale === "es"
              ? "Eventos y Conferencias"
              : "Events and Conferences",
          heroSubheading:
            locale === "es"
              ? "Próximos eventos donde puedes asistir, ser voluntario y compartir."
              : "Below you will find a list of upcoming events that you can attend, volunteer, and share with others.",
          heroBgImage: undefined,
        }}
        noButton
        fullWidth
      />

      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-16">
            {locale === "es" ? "Próximos Eventos" : "Upcoming Events"}
          </h2>

          <div className="space-y-8">
            {events.map((ev) => (
              <ExtendedEventCard
                key={ev._id}
                id={ev._id}
                title={ev.title}
                startDateTime={ev.startDateTime}
                endDateTime={ev.endDateTime}
                timezone={ev.timezone}
                description={ev.description}
                location={ev.location}
                imageUrl={ev.image?.asset?.url ?? "/placeholder.svg"}
                slug={`/${locale}/events/${ev.slug.current}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// import HeroBanner from "@/components/about/hero-banner";
// import { getConferences } from "@/lib/sanity/queries";
// import ExtendedEventCard from "@/components/ui/extended-event-card";
// import { useParams } from "next/navigation";

// export default async function EventsPage() {
//   const events = await getConferences();

//   return (
//     <main className="min-h-screen">
//       <HeroBanner
//         heroSection={{
//           heroHeading: "Events and Conferences",
//           heroSubheading:
//             "Below you will find a list of upcoming events that you can attend, volunteer, and share with others.",
//           heroBgImage: undefined,
//         }}
//         noButton
//         fullWidth
//       />
//       {/* Events List */}
//       <section className="py-12">
//         <div className="container mx-auto px-6">
//           <h2 className="text-3xl font-semibold text-gray-900 mb-16">
//             Upcoming Events
//           </h2>

//           <div className="space-y-8">
//             {events.map((event) => (
//               <ExtendedEventCard
//                 key={event._id}
//                 id={event._id}
//                 title={event.title}
//                 startDateTime={event.startDateTime}
//                 endDateTime={event.endDateTime}
//                 timezone={event.timezone}
//                 description={event.description}
//                 location={event.location}
//                 imageUrl={event.image?.asset?.url || "/placeholder.svg"}
//                 slug={event.slug.current}
//               />
//             ))}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
