import HeroBanner from "@/components/about/hero-banner";
import AllCampaignsContent from "./all-campaigns-content";

export default function CampaignsPage() {
  return (
    <main className="min-h-screen">
      <HeroBanner
        heroSection={{
          heroHeading: "Our Campaigns",
          heroSubheading: "Let's create peace in the world!",
          heroBgImage: undefined,
        }}
        noButton
        fullWidth
        bgImage="/worldmap.png"
        height="h-[400px] md:h-[500px]"
        textCenter
        dropShadow
      />
      <AllCampaignsContent />
    </main>
  );
}
