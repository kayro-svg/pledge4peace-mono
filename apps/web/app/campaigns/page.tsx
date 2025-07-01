import HeroBanner from "@/components/about/hero-banner";
import AllCampaignsContent from "./all-campaigns-content";
import { getCampaigns } from "@/lib/sanity/queries";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

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
      <AllCampaignsContent initialCampaigns={campaigns} />
    </main>
  );
}
