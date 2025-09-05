import HeroBanner from "@/components/about/hero-banner";
import PartnershipsSection from "@/components/about/partnerships-section";
import WhoWeAre from "@/components/about/who-we-are";
import ImpactStats from "@/components/about/impact-stats";
import MissionPhilosophy from "@/components/about/mission-philosophy";
import NonprofitMission from "@/components/about/nonprofit-mission";
import ContactInformationAndCommitment from "@/components/about/contact-information";
import { getAboutPageData } from "@/lib/sanity/queries";
import { Metadata } from "next";


// Generate static params for locales
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

// Generate metadata for About page
export async function generateMetadata({
  params,
}: {
  params: { locale: any };
}): Promise<Metadata> {
  const locale = await params.locale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const aboutUrl = locale === "en" ? `${baseUrl}/about` : `${baseUrl}/${locale}/about`;

  const title = locale === "es" 
    ? "Acerca de Nosotros | Pledge4Peace - Campañas Globales por la Paz"
    : "About Us | Pledge4Peace - Global Campaigns for Peace";
  
  const description = locale === "es"
    ? "Conoce nuestra misión de promover la paz, democracia y derechos humanos a través de campañas globales impulsadas por la comunidad."
    : "Learn about our mission to promote peace, democracy, and human rights through community-driven global campaigns.";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: locale === "es" 
      ? "acerca de, misión, paz, democracia, derechos humanos, organización"
      : "about us, mission, peace, democracy, human rights, organization",
    
    alternates: {
      canonical: aboutUrl,
    },

    openGraph: {
      title,
      description,
      url: aboutUrl,
      siteName: "Pledge4Peace",
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: "/p4p_logo_renewed.png",
          width: 1200,
          height: 630,
          alt: "Pledge4Peace - About Us",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/p4p_logo_renewed.png"],
      creator: "@Pledge4Peace",
      site: "@Pledge4Peace",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: any };
}) {
  const locale = await params.locale;

  // Fetch data with the current locale
  const aboutData = await getAboutPageData(locale as "en" | "es");

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroBanner heroSection={aboutData.heroSection} noButton />
      <WhoWeAre whoWeAreSection={aboutData.whoWeAreSection} />

      <div className="container mx-auto px-4 max-w-6xl py-0">
        {/* <ImpactStats /> */}

        <MissionPhilosophy
          ourMissionSection={aboutData.ourMissionSection}
          ourPhilosophySection={aboutData.ourPhilosophySection}
          ourCharterSection={aboutData.ourCharterSection}
        />

        {/* Partnerships Section */}
        {/* <PartnershipsSection /> */}

        <NonprofitMission
          missionHighlightCard={aboutData.missionHighlightCard}
          // ourCommitmentCard={aboutData.ourCommitmentCard}
        />
        <ContactInformationAndCommitment
          getInTouchCard={aboutData.getInTouchCard}
          ourCommitmentCard={aboutData.ourCommitmentCard}
        />
      </div>
    </main>
  );
}
