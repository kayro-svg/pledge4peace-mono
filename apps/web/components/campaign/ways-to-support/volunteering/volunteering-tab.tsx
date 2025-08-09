import { Users, Megaphone, Mail, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function VolunteeringTab() {
  const router = useRouter();
  const t = useTranslations("SingleCampaign_Page");
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t("offerYourTimeAndSkills")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("joinOurGlobalCommunityOfVolunteers")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("highProfileOutreach")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("connectWithCelebrities")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("communityCampaigns")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("launchLocalInitiatives")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("directMailCampaigns")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("helpDistributePeaceMessages")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("educationalOutreach")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("encourageKidsToWriteThoughtfulMessages")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("readyToMakeADifference")}
        </p>
        <Button
          className="w-full md:w-auto"
          onClick={() => router.push("/volunteer")}
        >
          {t("joinOurVolunteerTeam")}
        </Button>
      </div>
    </div>
  );
}
