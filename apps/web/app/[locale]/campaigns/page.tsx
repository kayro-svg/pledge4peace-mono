import HeroBanner from "@/components/about/hero-banner";
import AllCampaignsContent from "./all-campaigns-content";
import { useTranslations } from "next-intl";

export default function CampaignsPage() {
  const t = useTranslations("AllCampaigns_Page");
  return (
    <main className="min-h-screen">
      <HeroBanner
        heroSection={{
          heroHeading: t("campaigns_label"),
          heroSubheading: t("campaigns_description"),
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
