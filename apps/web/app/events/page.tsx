import HeroBanner from "@/components/about/hero-banner";
import { getConferences } from "@/lib/sanity/queries";
import ExtendedEventCard from "@/components/ui/extended-event-card";

export default async function EventsPage() {
  const events = await getConferences();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {/* <section className="relative h-[60vh] min-h-[400px] bg-gray-900">
        <Image
          src="/images/events-hero.jpg"
          alt="Events"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">EVENTS</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Risen seeks to actively engage our community with fellowship and
            love. Below you will find a list of upcoming events that you can
            attend, volunteer, and share with others.
          </p>
        </div>
      </section> */}
      {/* <div className="relative w-full overflow-hidden"> */}
      {/* Modern gradient background with curved bottom edge */}
      {/* <div className="bg-gradient-to-br from-[#2F4858] via-[#548281] to-[#8BB05C] py-24 px-8 text-white relative"> */}
      {/* <div className="absolute inset-0 bg-black/30 z-0"></div> */}

      {/* Optional: Add a background image */}
      {/* <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/peace-background.jpg"
            alt="Peace background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div> */}

      <HeroBanner
        title="Events and Conferences"
        content="Below you will find a list of upcoming events that you can attend, volunteer, and share with others."
        noButton
        fullWidth
      />

      {/* View Toggle */}
      {/* <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-end gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border-b-2 border-[#548281]">
              LIST
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-400">
              MONTH
            </button>
          </div>
        </div>
      </div> */}

      {/* Events List */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-16">
            Upcoming Events
          </h2>

          <div className="space-y-8">
            {events.map((event) => (
              <ExtendedEventCard
                key={event._id}
                id={event._id}
                title={event.title}
                date={event.date}
                description={event.description}
                location={event.location}
                imageUrl={event.image?.asset?.url || "/placeholder.svg"}
                slug={event.slug.current}
              />
            ))}
          </div>

          {/* Previous Events Link */}
          {/* <div className="mt-12 pt-8 border-t">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <span className="w-5 h-5 rounded-full border flex items-center justify-center">
                ←
              </span>
              Previous Events
            </button>
          </div> */}
        </div>
      </section>
    </main>
  );
}
