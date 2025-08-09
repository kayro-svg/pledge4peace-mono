"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CampaignDetailContentProps {
  campaign: SanityCampaign;
  locale: string;
}

export function CampaignDetailContent({
  campaign,
  locale,
}: CampaignDetailContentProps) {
  // Prefetching de la sesión para evitar múltiples llamadas al abrir el modal
  // Este hook hace que la sesión se cargue una sola vez aquí, y luego
  // estará disponible en caché para los componentes hijos
  useSession();
  const router = useRouter();
  // Estado para controlar el diálogo de comentarios
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeSolutionId, setActiveSolutionId] = useState("");
  const t = useTranslations("SingleCampaign_Page");
  // Referencia para evitar montajes innecesarios del contenido del diálogo
  const isCommentsContentMounted = useRef(false);
  // Referencia para navegar a las soluciones
  const contentTabsRef = useRef<ContentTabsRef>(null);

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

  return (
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
                <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
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
  );
}
