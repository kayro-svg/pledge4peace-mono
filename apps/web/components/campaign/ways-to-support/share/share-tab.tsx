"use client";

import { useState } from "react";
import { Share2, MessageCircle, Users, Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareSocialButton, ShareData } from "./share-social-button";
import { logger } from "@/lib/utils/logger";
import { useTranslations } from "next-intl";

interface ShareTabProps {
  campaignSlug?: string;
  // After query normalization, title is a plain string
  campaignTitle?: string;
}

export default function ShareTab({
  campaignSlug,
  campaignTitle,
}: ShareTabProps) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const t = useTranslations("SingleCampaign_Page");

  // Create campaign-specific URL
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://pledge4peace.org";
  const campaignUrl = campaignSlug
    ? `${baseUrl}/campaigns/${campaignSlug}`
    : baseUrl;

  const safeTitle: string | undefined = campaignTitle || undefined;

  const shareData: ShareData = {
    title: safeTitle ? `Support: ${safeTitle}` : "Pledge for Peace",
    text: safeTitle
      ? `Join me in supporting "${safeTitle}" and other peace initiatives around the world. Together we can make a difference!`
      : "Join me in supporting peace initiatives around the world. Together we can make a difference!",
    url: campaignUrl,
    hashtags: "PeaceForAll,Pledge4Peace",
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      return true;
    } catch (err) {
      logger.error("Failed to copy text:", err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        return true;
      } catch (fallbackErr) {
        logger.error("Fallback copy failed:", fallbackErr);
        return false;
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t("exploreOtherWaysToHelp")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("amplifyOurMessageOfPeace")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("socialMedia")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("shareOurCampaignOnWhatsAppFacebookXLinkedIn")}
            </p>
            <ShareSocialButton shareData={shareData} />
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("wordOfMouth")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("talkToFamilyFriendsAndColleagues")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("communityGroups")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                "presentOurMissionToLocalOrganizationsReligiousGroupsAndCommunityAssociations"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t("personalNetworks")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("sendPersonalizedMessagesToYourContacts")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-center">{t("shareOurCampaignLink")}</h4>
        <div className="flex gap-2">
          <div className="flex-1 bg-background rounded border px-3 py-2 text-sm text-muted-foreground break-all">
            {shareData.url}
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await copyToClipboard(shareData.url);
            }}
            disabled={isLinkCopied}
            className="whitespace-nowrap"
          >
            {isLinkCopied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
