"use client";

import AuthContainer from "@/components/login/auth-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { portableTextComponents } from "@/components/ui/portable-text-components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  getSolutions,
  getUserInteractions,
  submitSolution,
} from "@/lib/api/solutions";
import { API_URL } from "@/lib/config";
import { SanitySolutionsSection, SanityParty, Solution } from "@/lib/types";
import { logger } from "@/lib/utils/logger";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { PortableText } from "@portabletext/react";
import { Loader2, LogIn, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useInteractions } from "../shared/interaction-context";
import SolutionPost from "./solution-post";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

interface PeaceAgreementContentProps {
  campaignId: string;
  solutionsSection: SanitySolutionsSection;
  campaignSlug?: string;
  campaignTitle?: string;
  onSolutionChange?: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  activeSolutionId?: string;
  parties: SanityParty[]; // Nuevo: partidos dinámicos de la campaña
}

export type PartyConfig = Record<
  string,
  {
    label: string;
    icon: JSX.Element;
    color: string;
    description: string;
  }
>;

type ViewMode = "mixed" | "grouped";

export default function PeaceAgreementContent({
  campaignId,
  campaignTitle,
  campaignSlug,
  onSolutionChange,
  onCommentClick,
  activeSolutionId,
  solutionsSection,
  parties,
}: PeaceAgreementContentProps) {
  const searchParams = useSearchParams();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateSolutionOpen, setIsCreateSolutionOpen] = useState(false);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Localization helpers (must be declared before usage below)
  const { getString, getText } = useLocaleContent();

  // Helper para obtener el primer party slug como default
  const getDefaultPartySlug = useCallback(() => {
    return parties?.[0]?.slug || "";
  }, [parties]);

  const [newSolution, setNewSolution] = useState({
    title: "",
    description: "",
    partyId: getDefaultPartySlug(),
  });

  // Actualizar partyId si cambian los partidos
  useEffect(() => {
    if (parties && parties.length > 0 && !newSolution.partyId) {
      setNewSolution((prev) => ({ ...prev, partyId: getDefaultPartySlug() }));
    }
  }, [parties, newSolution.partyId, getDefaultPartySlug]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [solutionStats, setSolutionStats] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("mixed");
  const [partyCounts, setPartyCounts] = useState<Record<string, number>>({
    total: 0,
  });
  const { getInteractionCount, forceInitializeSolution } = useInteractions();

  // Helper function to get the most up-to-date stats for a solution
  const getUpdatedStats = useCallback(
    (solutionId: string) => {
      const serverStats = solutionStats[solutionId] || {
        likes: 0,
        dislikes: 0,
        shares: 0,
        comments: 0,
      };

      // Get counts from interaction context (which may be more up-to-date)
      const contextLikes = getInteractionCount("like", solutionId);
      const contextDislikes = getInteractionCount("dislike", solutionId);
      const contextShares = getInteractionCount("share", solutionId);
      const contextComments = getInteractionCount("comment", solutionId);

      return {
        likes: contextLikes || serverStats.likes,
        dislikes: contextDislikes || serverStats.dislikes,
        shares: contextShares || serverStats.shares,
        comments: contextComments || serverStats.comments,
      };
    },
    [solutionStats, getInteractionCount]
  );

  // Generar configuración dinámica basada en los partidos del CMS
  const partyConfig: PartyConfig = useMemo(() => {
    const config: PartyConfig = {};

    parties?.forEach((party) => {
      const colorMap = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        red: "bg-red-50 text-red-700 border-red-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        orange: "bg-orange-50 text-orange-700 border-orange-200",
        teal: "bg-teal-50 text-teal-700 border-teal-200",
        gray: "bg-gray-50 text-gray-700 border-gray-200",
      };

      config[party.slug] = {
        label:
          getString(party.name as any) ||
          (typeof party.name === "string" ? party.name : ""),
        icon: (
          <Image
            src={getSanityImageUrl(party.icon.asset.url, 40, 32, 80)}
            alt={`${party.name} icon`}
            width={20}
            height={16}
            style={{ width: "auto", height: "auto" }}
            className="w-4 h-4 object-cover !w-4 !h-4"
          />
        ),
        color: colorMap[party.color] || colorMap.blue,
        description:
          getText(party.description as any) ||
          (typeof party.description === "string" ? party.description : ""),
      };
    });

    return config;
  }, [parties, getString, getText]);

  useEffect(() => {
    const fetchSolutions = async () => {
      if (!campaignId) return;

      setIsLoading(true);
      try {
        const fetchedSolutions = await getSolutions(campaignId);
        setSolutions(fetchedSolutions);

        // Fetch stats for all solutions in the campaign
        const statsRes = await fetch(
          `${API_URL}/solutions/campaign/${campaignId}/stats`
        );
        if (statsRes.ok) {
          const statsArr = await statsRes.json();
          const statsMap: Record<string, any> = {};
          statsArr.forEach((item: any) => {
            statsMap[item.solutionId] = item.stats;
          });
          setSolutionStats(statsMap);
        }

        // Fetch party counts
        const partyCountsRes = await fetch(
          `${API_URL}/solutions/campaign/${campaignId}/party-counts`
        );
        if (partyCountsRes.ok) {
          const counts = await partyCountsRes.json();
          setPartyCounts(counts);
        }

        // Only fetch user interactions if user is authenticated
        if (session?.accessToken) {
          const interactionPromises = fetchedSolutions.map(async (solution) => {
            try {
              const userInt = await getUserInteractions(solution.id);
              return {
                solutionId: solution.id,
                interactions: userInt,
              };
            } catch (e) {
              logger.warn(
                `Failed to fetch interactions for solution ${solution.id}:`,
                e
              );
              return {
                solutionId: solution.id,
                interactions: {
                  hasLiked: false,
                  hasDisliked: false,
                  hasShared: false,
                },
              };
            }
          });

          const interactions = await Promise.all(interactionPromises);
          interactions.forEach(({ solutionId, interactions }) => {
            // Use forceInitializeSolution to ensure fresh state on page load
            forceInitializeSolution(
              solutionId,
              {
                likes: solutionStats[solutionId]?.likes || 0,
                dislikes: solutionStats[solutionId]?.dislikes || 0,
                shares: solutionStats[solutionId]?.shares || 0,
                comments: solutionStats[solutionId]?.comments || 0,
              },
              interactions
            );
          });
        }
      } catch (error) {
        logger.error("Error fetching solutions:", error);
        toast.error("Failed to load solutions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, session?.accessToken]);

  // Ensure target solution is expanded and scrolled into view when activeSolutionId changes
  useEffect(() => {
    if (!activeSolutionId) return;

    // Expand the target solution in local state
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === activeSolutionId
          ? ({ ...(s as any), expanded: true } as any)
          : s
      )
    );

    const targetSelector = `[data-solution-id="${activeSolutionId}"] .solution-card, [data-solution-id="${activeSolutionId}"]`;
    const performScroll = (node: HTMLElement) => {
      const headerOffset = 100;
      const elementPosition =
        node.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      node.classList.add("ring-2", "ring-[#2F4858]/20");
      setTimeout(() => {
        node.classList.remove("ring-2", "ring-[#2F4858]/20");
      }, 1200);
    };

    // If already in DOM, scroll immediately
    const existing = document.querySelector(
      targetSelector
    ) as HTMLElement | null;
    if (existing) {
      performScroll(existing);
      return;
    }

    // Otherwise, observe DOM mutations until the element appears
    const observer = new MutationObserver(() => {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (el) {
        performScroll(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [activeSolutionId]);

  const toggleExpand = (solutionId: string) => {
    setSolutions((prevSolutions) =>
      prevSolutions.map((solution) =>
        solution.id === solutionId
          ? { ...solution, expanded: !solution.expanded }
          : solution
      )
    );

    if (onSolutionChange) {
      onSolutionChange(solutionId);
    }
  };

  const handleCreateSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create party limits object from campaign parties
      // BACKWARD COMPATIBILITY: Use solutionLimit if available, otherwise default to 5
      const partyLimits =
        parties?.reduce(
          (acc, party) => {
            acc[party.slug] = party.solutionLimit || 5; // Fallback for campaigns without solutionLimit
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      logger.log("campaignSlug", campaignSlug);
      logger.log("campaignTitle", campaignTitle);

      await submitSolution({
        campaignId,
        title: newSolution.title,
        description: newSolution.description,
        partyId: newSolution.partyId,
        partyLimits,
        metadata: {
          campaignTitle: campaignTitle || "",
          campaignSlug: campaignSlug || "",
        },
      });

      // Ensure the created solution has all necessary properties
      // Do NOT add to public list immediately; it awaits moderation

      // Do not change counts until approved

      // No stats update needed until approval

      // Show success
      toast.success("Your solution has been submitted for moderation.");

      setIsCreateSolutionOpen(false);
      setNewSolution({
        title: "",
        description: "",
        partyId: getDefaultPartySlug(),
      });
      // No extra toast
    } catch (error) {
      logger.error("Error creating solution:", error);
      toast.error("Failed to create solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSolutionButton = () => {
    // Calculate total limit from all parties' individual limits
    // BACKWARD COMPATIBILITY: Use solutionLimit if available, otherwise default to 5
    const maxTotal =
      parties?.reduce((sum, party) => sum + (party.solutionLimit || 5), 0) ||
      10;

    if (partyCounts.total >= maxTotal) {
      return (
        <div className="text-center text-sm text-gray-500">
          Campaign limit reached ({partyCounts.total}/{maxTotal} solutions)
        </div>
      );
    }

    // Check if any party can still add solutions
    // BACKWARD COMPATIBILITY: Use solutionLimit if available, otherwise default to 5
    const canAnyPartyAdd =
      parties?.some((party) => {
        const currentCount = partyCounts[party.slug] || 0;
        const partyLimit = party.solutionLimit || 5; // Fallback for campaigns without solutionLimit
        return currentCount < partyLimit;
      }) || false;

    if (!canAnyPartyAdd) {
      return (
        <div className="text-center text-sm text-gray-500">
          All party limits reached
        </div>
      );
    }

    return (
      <Button
        onClick={() => {
          if (!session) {
            setShowLoginModal(true);
            return;
          }
          // Ensure partyId is set when opening modal
          if (parties.length === 1 && !newSolution.partyId) {
            setNewSolution((prev) => ({ ...prev, partyId: parties[0].slug }));
          }
          setIsCreateSolutionOpen(true);
        }}
        className="flex items-center gap-2 w-full md:w-auto bg-slate-600 hover:bg-slate-700"
      >
        {session ? <Plus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {session
          ? parties.length === 1
            ? "Add Solution"
            : "Add Solution"
          : "Sign in to add a solution"}
      </Button>
    );
  };

  // Sort solutions by likes in descending order
  // Solutions are sorted on initial load and refresh, but maintain position during user interactions
  const sortedSolutions = useMemo(() => {
    return [...solutions].sort((a, b) => {
      // Use server stats for consistent sorting (not context updates)
      // This ensures ranking is based on persistent data, not temporary optimistic updates
      const aStats = solutionStats[a.id] || {
        likes: 0,
        dislikes: 0,
        shares: 0,
        comments: 0,
      };
      const bStats = solutionStats[b.id] || {
        likes: 0,
        dislikes: 0,
        shares: 0,
        comments: 0,
      };

      const aLikes = aStats.likes;
      const bLikes = bStats.likes;

      // Sort by likes in descending order (most likes first)
      if (aLikes !== bLikes) {
        return bLikes - aLikes;
      }

      // If same likes, maintain original order (newer solutions stay at bottom)
      return 0;
    });
  }, [solutions, solutionStats]);

  // Group solutions by party - DYNAMIC based on CMS parties
  const groupedSolutions = useMemo(() => {
    const grouped: Record<string, typeof sortedSolutions> = {};

    // Initialize groups for each party from CMS
    parties?.forEach((party) => {
      grouped[party.slug] = sortedSolutions.filter(
        (s) => s.partyId === party.slug
      );
    });

    return grouped;
  }, [sortedSolutions, parties]);

  // Función para refrescar solutions después de cambios
  const refreshSolutions = async (skipLoading = false) => {
    if (!campaignId) return;

    if (!skipLoading) {
      setIsLoading(true);
    }

    try {
      const fetchedSolutions = await getSolutions(campaignId);

      // Only update solutions if we got valid data
      if (Array.isArray(fetchedSolutions)) {
        setSolutions(fetchedSolutions);

        // Refetch stats
        const statsRes = await fetch(
          `${API_URL}/solutions/campaign/${campaignId}/stats`
        );
        if (statsRes.ok) {
          const statsArr = await statsRes.json();
          const statsMap: Record<string, any> = {};
          statsArr.forEach((item: any) => {
            statsMap[item.solutionId] = item.stats;
          });
          setSolutionStats(statsMap);
        }

        // Refetch party counts
        const partyCountsRes = await fetch(
          `${API_URL}/solutions/campaign/${campaignId}/party-counts`
        );
        if (partyCountsRes.ok) {
          const counts = await partyCountsRes.json();
          setPartyCounts(counts);
        }
      }
    } catch (error) {
      logger.error("Error refreshing solutions:", error);
      if (!skipLoading) {
        toast.error("Failed to refresh solutions");
      }
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Dynamic content section */}
        <div className="prose max-w-none">
          {solutionsSection?.heading && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {getString(solutionsSection.heading as any) ||
                (typeof solutionsSection.heading === "string"
                  ? solutionsSection.heading
                  : "")}
            </h2>
          )}

          {solutionsSection.introParagraphs &&
            Array.isArray(solutionsSection.introParagraphs) && (
              <PortableText
                value={solutionsSection.introParagraphs}
                components={portableTextComponents}
              />
            )}
        </div>

        <div id="solutions-section">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-8 md:gap-0">
            <h2 className="text-2xl font-bold">
              {getString(solutionsSection.subheading as any) ||
                (typeof solutionsSection.subheading === "string"
                  ? solutionsSection.subheading
                  : "")}
            </h2>
            <div className="flex w-full md:w-auto items-end">
              {addSolutionButton()}
            </div>
          </div>

          {/* View Toggle - Only show when there are multiple parties */}
          {solutions.length > 0 && parties.length > 1 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 p-4 bg-white rounded-lg border mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="font-medium text-gray-700">View Mode:</span>
                <div className="flex md:items-center gap-2">
                  <Button
                    variant={viewMode === "mixed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("mixed")}
                    className="flex items-center gap-2"
                  >
                    {viewMode === "mixed" ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                    Mixed View
                  </Button>
                  <Button
                    variant={viewMode === "grouped" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grouped")}
                    className="flex items-center gap-2"
                  >
                    {viewMode === "grouped" ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                    Grouped by Party
                  </Button>
                </div>
              </div>

              {/* Party counters - Only show when there are multiple parties */}
              {parties.length > 1 ? (
                <div className="flex gap-4 text-sm">
                  {Object.entries(partyConfig).map(([key, config]) => {
                    // Find the party's solution limit from the parties array
                    const party = parties?.find((p) => p.slug === key);
                    const maxPerParty = party?.solutionLimit || 5; // Default to 5 if not found
                    const currentCount = partyCounts[key] || 0;

                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-4 h-4">{config.icon}</span>
                        <span
                          className={`font-medium transition-colors duration-200 ${currentCount >= maxPerParty ? "text-red-600" : "text-gray-700"}`}
                        >
                          {currentCount}/{maxPerParty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // For single party, show total count instead
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {partyCounts.total}/{parties[0]?.solutionLimit || 5}{" "}
                    solutions
                  </span>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading solutions...</div>
          ) : solutions.length === 0 ? (
            <div className="text-center justify-center items-center flex flex-col py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No solutions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to propose a solution for this campaign
              </p>
              {/* <div className="mt-4">{addSolutionButton()}</div> */}
            </div>
          ) : viewMode === "mixed" || parties.length === 1 ? (
            <div className="space-y-6">
              {sortedSolutions.map((solution, index) => (
                <div key={solution.id} className="relative">
                  <SolutionPost
                    rank={index + 1}
                    solution={{
                      ...(solution as any),
                      partyId: solution.partyId || "israeli",
                      likes:
                        (solution as any).likes ??
                        getUpdatedStats(solution.id).likes,
                      comments:
                        (solution as any).comments ??
                        getUpdatedStats(solution.id).comments,
                      stats: getUpdatedStats(solution.id),
                    }}
                    onCommentClick={onCommentClick}
                    activeSolutionId={activeSolutionId || ""}
                    onSolutionChange={onSolutionChange || (() => {})}
                    toggleExpand={toggleExpand}
                    onRefresh={refreshSolutions}
                    showPartyBadge={parties.length > 1}
                    postPartyConfig={partyConfig}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSolutions).map(
                ([partyId, solutionList]) => (
                  <div key={partyId}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        className={`${partyConfig[partyId]?.color || ""} text-base px-3 py-1 hover:bg-transparent`}
                      >
                        <span className="mr-2">
                          {partyConfig[partyId]?.icon}
                        </span>
                        {partyConfig[partyId]?.label}
                      </Badge>
                      <span className="text-gray-500">
                        ({solutionList.length} solutions)
                      </span>
                    </div>
                    <div className="space-y-4">
                      {solutionList.map((solution, index) => (
                        <div key={solution.id} className="relative">
                          {/* No highlight for newly created (pending moderation) */}
                          <SolutionPost
                            rank={
                              sortedSolutions.findIndex(
                                (s) => s.id === solution.id
                              ) + 1
                            }
                            solution={{
                              ...(solution as any),
                              partyId: solution.partyId || "israeli",
                              likes:
                                (solution as any).likes ??
                                getUpdatedStats(solution.id).likes,
                              comments:
                                (solution as any).comments ??
                                getUpdatedStats(solution.id).comments,
                              stats: getUpdatedStats(solution.id),
                            }}
                            onCommentClick={onCommentClick}
                            activeSolutionId={activeSolutionId || ""}
                            onSolutionChange={onSolutionChange || (() => {})}
                            toggleExpand={toggleExpand}
                            onRefresh={refreshSolutions}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <Dialog
          open={isCreateSolutionOpen}
          onOpenChange={setIsCreateSolutionOpen}
        >
          <DialogContent className="sm:max-w-lg h-[80vh] md:h-[fit-content]">
            <DialogHeader>
              <DialogTitle>Create New Solution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSolution} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newSolution.title}
                  onChange={(e) =>
                    setNewSolution((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter a title for your solution"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {parties.length === 1
                    ? "Solution directed to:"
                    : "I want to direct my solution to"}
                </Label>
                {parties.length === 1 ? (
                  // Single party: show as informational display
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4">
                        {partyConfig[parties[0]?.slug]?.icon}
                      </span>
                      <span className="font-medium">
                        {partyConfig[parties[0]?.slug]?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({partyCounts[parties[0]?.slug] || 0}/
                        {parties[0]?.solutionLimit || 5})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {partyConfig[parties[0]?.slug]?.description}
                    </p>
                  </div>
                ) : (
                  // Multiple parties: show radio group selection
                  <RadioGroup
                    value={newSolution.partyId}
                    onValueChange={(value: string) =>
                      setNewSolution({ ...newSolution, partyId: value })
                    }
                    className="mt-2"
                  >
                    {Object.entries(partyConfig).map(([key, config]) => {
                      // Find the party's solution limit from the parties array
                      const party = parties?.find((p) => p.slug === key);
                      const maxPerParty = party?.solutionLimit || 5; // Default to 5 if not found
                      const currentCount = partyCounts[key] || 0;
                      const isDisabled = currentCount >= maxPerParty;

                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={key}
                              id={key}
                              disabled={isDisabled}
                              className={
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            />
                            <Label
                              htmlFor={key}
                              className={`flex items-center gap-2 font-medium ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span className="w-4 h-4">{config.icon}</span>
                              {config.label}
                              <span className="text-xs text-gray-500">
                                ({currentCount}/{maxPerParty})
                              </span>
                            </Label>
                          </div>
                          <p
                            className={`text-sm text-gray-500 ml-6 ${isDisabled ? "opacity-50" : ""}`}
                          >
                            {config.description}
                            {isDisabled && (
                              <span className="text-red-500 block">
                                ⚠️ Limit reached for this party
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newSolution.description}
                  onChange={(e) =>
                    setNewSolution((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your solution in detail"
                  required
                  className="min-h-[150px]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateSolutionOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Solution"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        {/* <DialogContent className="max-w-lg w-full max-h-[80vh] md:max-h-[85%]"> */}
        <DialogContent className="max-w-lg w-full h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                {parties.length === 1
                  ? "To add a solution you must login"
                  : "To propose a solution to any party you must login"}
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => {
                setShowLoginModal(false);
                setIsCreateSolutionOpen(true);
              }}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
