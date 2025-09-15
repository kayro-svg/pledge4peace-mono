"use client";

import { useState, useRef, useEffect } from "react";
import MainContentSection from "@/components/campaign/campaign-main-content/campaign-main-content";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SidebarSection from "@/components/campaign/sidebar/sidebar-section";
import ContentTabs, {
  ContentTabsRef,
} from "@/components/campaign/content-tabs/content-tabs";
import { InteractionProvider } from "@/components/campaign/shared/interaction-context";
import {
  SanityCampaign,
  SanitySolutionsSection,
  SanityWaysToSupportTab,
} from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

interface CampaignDetailContentProps {
  campaign: SanityCampaign;
  locale: string;
}

export function CampaignDetailContent({
  campaign,
  locale,
}: CampaignDetailContentProps) {
  // Session is now hydrated server-side, no need for prefetching
  const router = useRouter();
  const searchParams = useSearchParams();
  // Estado para controlar el diálogo de comentarios
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeSolutionId, setActiveSolutionId] = useState("");
  const t = useTranslations("SingleCampaign_Page");
  // Referencia para evitar montajes innecesarios del contenido del diálogo
  const isCommentsContentMounted = useRef(false);
  // Referencia para navegar a las soluciones
  const contentTabsRef = useRef<ContentTabsRef>(null);
  // Deep-link handler: on mount, if solutionId/commentId/action are present, navigate and focus
  useEffect(() => {
    const solutionId = searchParams.get("solutionId");
    const commentId = searchParams.get("commentId");
    const action = searchParams.get("action");

    if (solutionId) {
      setActiveSolutionId(solutionId);
      // Navigate to solutions tab and scroll
      setTimeout(() => {
        contentTabsRef.current?.navigateToSolutions();

        // If commentId provided, open comments sidebar/dialog
        if (commentId) {
          // For desktop, ensure comments section is visible by selecting the solution
          // For mobile (<1024), open dialog
          if (window.innerWidth < 1024) {
            setIsCommentsOpen(true);
          }
          // Ensure SidebarSection renders the selected solution's comments on desktop
          // by keeping activeSolutionId set, CommentsSection will mount for that ID

          // Try to highlight the comment element if rendered with data-comment-id
          setTimeout(() => {
            const commentEl = document.querySelector(
              `[data-comment-id="${commentId}"] .comment-item, [data-comment-id="${commentId}"]`
            );
            if (commentEl) {
              (commentEl as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              (commentEl as HTMLElement).classList.add(
                "ring-2",
                "ring-[#2F4858]/40"
              );
              setTimeout(() => {
                (commentEl as HTMLElement).classList.remove(
                  "ring-2",
                  "ring-[#2F4858]/40"
                );
              }, 2000);
            }
          }, 600);
        }
      }, 200);
    }
  }, [searchParams]);

  // Precargar el componente SidebarSection solo cuando sea necesario
  useEffect(() => {
    if (isCommentsOpen && activeSolutionId) {
      isCommentsContentMounted.current = true;
    }
  }, [isCommentsOpen, activeSolutionId]);

  const handleCommentClick = (solutionId: string | React.MouseEvent) => {
    // Extract solutionId if it's an event (from mobile view) or use it directly (from desktop view)
    const id = typeof solutionId === "string" ? solutionId : activeSolutionId;
    if (id) {
      setActiveSolutionId(id);
      // For mobile and tablet, open comments in a dialog
      // For desktop, we'll handle comments differently (inline or in sidebar)
      if (window.innerWidth < 1024) {
        setIsCommentsOpen(true);
      }
    }
  };

  const handleNavigateToSolutions = () => {
    contentTabsRef.current?.navigateToSolutions();
  };

  // Generate structured data for the campaign
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const campaignUrl = `${baseUrl}/${locale}/campaigns/${campaign.slug.current}`;
  const campaignImage = campaign.featuredImage?.asset?.url
    ? getSanityImageUrl(campaign.featuredImage.asset.url, 1200, 630, 80)
    : `${baseUrl}/p4p_logo_renewed.png`;

  const campaignStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event", // Campaigns are events/initiatives
    name: campaign.title,
    description:
      campaign.description ||
      `Join our campaign: ${campaign.title}. Take action for peace and democracy.`,
    image: campaignImage,
    url: campaignUrl,

    // Organization details
    organizer: {
      "@type": "Organization",
      name: "Pledge4Peace",
      url: baseUrl,
      logo: `${baseUrl}/p4p_logo_renewed.png`,
      sameAs: [
        "https://www.youtube.com/@Pledge4Peace",
        "https://www.linkedin.com/groups/14488545/",
        "https://www.facebook.com/share/1F8FxiQ6Hh/",
        "https://x.com/pledge4peaceorg",
        "https://www.instagram.com/pledge4peaceorg",
        "https://www.tiktok.com/@pledge4peace5",
      ],
    },

    // Event details
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",

    // Location (virtual/online)
    location: {
      "@type": "VirtualLocation",
      url: campaignUrl,
      name: "Pledge4Peace Platform",
    },

    // Timing
    startDate: campaign._createdAt,
    // endDate: undefined, // No endDate property in SanityCampaign

    // Additional properties
    about: [
      "Peace building",
      "Democracy",
      "Human rights",
      "Social justice",
      "Global campaigns",
    ],

    // Participation details
    isAccessibleForFree: true,
    inLanguage: [locale === "es" ? "es" : "en"],

    // Keywords
    keywords: `peace campaign, ${campaign.title}, democracy, human rights, social justice, global action`,

    // Publisher
    publisher: {
      "@type": "Organization",
      name: "Pledge4Peace",
      url: baseUrl,
    },
  };

  return (
    <>
      {/* Campaign Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(campaignStructuredData, null, 2),
        }}
      />

      <main className="min-h-screen bg-[#fffef5]">
        <div className="container mx-auto px-4 py-8">
          <div className="w-full mx-auto">
            <div className="mb-8">
              <Button
                onClick={() => router.back()}
                className="text-brand-500 hover:underline flex items-center bg-transparent border-none hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("goBack")}
              </Button>
            </div>

            <div className="flex flex-col gap-8">
              <MainContentSection
                campaign={campaign}
                locale={locale}
                onNavigateToSolutions={handleNavigateToSolutions}
              />
              <InteractionProvider>
                <ContentTabs
                  ref={contentTabsRef}
                  sidebarWidth="30%"
                  solutionsSection={
                    campaign?.solutionsSection as SanitySolutionsSection
                  }
                  waysToSupportTabs={
                    campaign?.waysToSupportTabs as SanityWaysToSupportTab[]
                  }
                  campaignId={campaign?._id}
                  activeSolutionId={activeSolutionId}
                  onSolutionChange={setActiveSolutionId}
                  onCommentClick={handleCommentClick}
                  campaignSlug={campaign?.slug?.current}
                  campaignTitle={campaign?.title as unknown as string}
                  parties={campaign?.parties || []}
                />

                {/* Mobile Comments Modal - Only visible on mobile/tablet */}
                <div className="lg:hidden">
                  <Dialog
                    open={isCommentsOpen}
                    onOpenChange={setIsCommentsOpen}
                  >
                    <DialogContent className="lg:hidden max-h-[80vh] lg:max-h-[100vh] md:max-w-[500px] h-[80vh] md:h-[fit-content] p-0 overflow-hidden flex flex-col gap-0">
                      <DialogHeader className="p-4 h-fit w-full justify-center items-center flex">
                        <DialogTitle>Comments</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto">
                        {/* Renderizamos el contenido solo cuando realmente se necesite */}
                        {isCommentsOpen && activeSolutionId ? (
                          <div className="p-2 h-full">
                            {/* Pasamos la sesión ya cargada para evitar que vuelva a fetchear */}
                            <SidebarSection
                              solutionId={activeSolutionId}
                              key={`sidebar-${activeSolutionId}`}
                            />
                          </div>
                        ) : (
                          <div className="p-6 text-center h-full flex items-center justify-center">
                            <p>Select a solution to view comments</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </InteractionProvider>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
