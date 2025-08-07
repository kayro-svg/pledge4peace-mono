// apps/web/app/[locale]/events/page.tsx
import HeroBanner from "@/components/about/hero-banner";
import ExtendedEventCard from "@/components/ui/extended-event-card";
import { getConferences } from "@/lib/sanity/queries";

export async function generateStaticParams() {
  const locales = ["en", "es"]; // ajusta según i18n
  return locales.map((locale) => ({ locale }));
}

export default async function EventsPage({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  const events = await getConferences(locale as "en" | "es");

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
                slug={ev.slug.current}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
