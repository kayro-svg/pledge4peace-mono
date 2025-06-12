"use client";

import AuthContainer from "@/components/login/auth-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getSolutions, getUserInteractions } from "@/lib/api/solutions";
import { API_ENDPOINTS, API_URL } from "@/lib/config";
import { SanitySolutionsSection, Solution } from "@/lib/types";
import {
  Loader2,
  Plus,
  LogIn,
  ToggleLeft,
  ToggleRight,
  Lightbulb,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useInteractions } from "../shared/interaction-context";
import SolutionPost from "./solution-post";
import { logger } from "@/lib/utils/logger";
import { IsraelFlag } from "@/components/ui/flags";
import { PalestineFlag } from "@/components/ui/flags";

interface PeaceAgreementContentProps {
  campaignId: string;
  solutionsSection: SanitySolutionsSection;
  campaignSlug?: string;
  onSolutionChange?: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  activeSolutionId?: string;
}

export type PartyConfig = {
  israeli: {
    label: string;
    icon: JSX.Element;
    color: string;
    description: string;
  };
  palestinian: {
    label: string;
    icon: JSX.Element;
    color: string;
    description: string;
  };
};

type PartyId = "israeli" | "palestinian";
type ViewMode = "mixed" | "grouped";

export default function PeaceAgreementContent({
  campaignId,
  onSolutionChange,
  onCommentClick,
  activeSolutionId,
  solutionsSection,
}: PeaceAgreementContentProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateSolutionOpen, setIsCreateSolutionOpen] = useState(false);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSolution, setNewSolution] = useState({
    title: "",
    description: "",
    partyId: "israeli" as PartyId,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [solutionStats, setSolutionStats] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("mixed");
  const [partyCounts, setPartyCounts] = useState({
    israeli: 0,
    palestinian: 0,
    total: 0,
  });
  const [newlyCreatedSolutionId, setNewlyCreatedSolutionId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { setUserInteraction, getUserInteraction, getInteractionCount } =
    useInteractions();

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

  const partyConfig: PartyConfig = {
    israeli: {
      label: "Israel",
      icon: <IsraelFlag width={20} height={16} />,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Solutions directed to Israeli leadership and decision-makers",
    },
    palestinian: {
      label: "Palestine",
      icon: <PalestineFlag width={20} height={16} />,
      color: "bg-green-50 text-green-700 border-green-200",
      description:
        "Solutions directed to Palestinian leadership and decision-makers",
    },
  };

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
            // Get current state from context (which may have been loaded from sessionStorage)
            const currentLiked = getUserInteraction("like", solutionId);
            const currentDisliked = getUserInteraction("dislike", solutionId);
            const currentShared = getUserInteraction("share", solutionId);

            // Only update from server if there's no local state (meaning the user hasn't interacted yet in this session)
            // Check if we have any interaction data in context for this solution
            const hasLocalInteractionData =
              getInteractionCount("like", solutionId) > 0 ||
              getInteractionCount("dislike", solutionId) > 0 ||
              currentLiked ||
              currentDisliked ||
              currentShared;

            if (!hasLocalInteractionData) {
              // No local data, safe to use server data
              if (interactions.hasLiked !== currentLiked) {
                setUserInteraction("like", solutionId, interactions.hasLiked);
              }
              if (interactions.hasDisliked !== currentDisliked) {
                setUserInteraction(
                  "dislike",
                  solutionId,
                  interactions.hasDisliked
                );
              }
              if (interactions.hasShared !== currentShared) {
                setUserInteraction("share", solutionId, interactions.hasShared);
              }
            }
            // If we have local data, keep it (user interacted in this session and it's stored in sessionStorage)
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
      const response = await fetch(API_ENDPOINTS.solutions.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          campaignId,
          title: newSolution.title,
          description: newSolution.description,
          partyId: newSolution.partyId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create solution");
      }

      const createdSolution = await response.json();

      // Ensure the created solution has all necessary properties
      const completeSolution = {
        ...createdSolution,
        partyId: createdSolution.partyId || newSolution.partyId,
        likes: 0,
        comments: 0,
        expanded: false,
      };

      // Add to the end of the list (new solutions go at bottom since they have no likes)
      setSolutions((prev) => [...prev, completeSolution]);

      // Update party counts immediately
      setPartyCounts((prev) => ({
        ...prev,
        [newSolution.partyId]: prev[newSolution.partyId] + 1,
        total: prev.total + 1,
      }));

      // Update stats for the new solution
      setSolutionStats((prev) => ({
        ...prev,
        [createdSolution.id]: {
          likes: 0,
          dislikes: 0,
          shares: 0,
          comments: 0,
        },
      }));

      // Mark as newly created for visual feedback
      setNewlyCreatedSolutionId(createdSolution.id);

      // Remove the "newly created" highlight after 3 seconds
      setTimeout(() => {
        setNewlyCreatedSolutionId(null);
      }, 3000);

      setIsCreateSolutionOpen(false);
      setNewSolution({ title: "", description: "", partyId: "israeli" });
      toast.success(
        `Solution created successfully! Directed to ${partyConfig[newSolution.partyId].label}`
      );
    } catch (error) {
      logger.error("Error creating solution:", error);
      toast.error("Failed to create solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSolutionButton = () => {
    const maxTotal = 10;
    const maxPerParty = Math.floor(maxTotal / 2); // 5 per party

    if (partyCounts.total >= maxTotal) {
      return (
        <div className="text-center text-sm text-gray-500">
          Campaign limit reached ({partyCounts.total}/{maxTotal} solutions)
        </div>
      );
    }

    const canAddIsraeli = partyCounts.israeli < maxPerParty;
    const canAddPalestinian = partyCounts.palestinian < maxPerParty;

    if (!canAddIsraeli && !canAddPalestinian) {
      return (
        <div className="text-center text-sm text-gray-500">
          All party limits reached (5/5 each)
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
          setIsCreateSolutionOpen(true);
        }}
        className="flex items-center gap-2 w-full md:w-auto bg-slate-600 hover:bg-slate-700"
      >
        {session ? <Plus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {session ? "Add Solution" : "Sign in to add a solution"}
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

  // Group solutions by party
  const groupedSolutions = {
    israeli: sortedSolutions.filter((s) => s.partyId === "israeli"),
    palestinian: sortedSolutions.filter((s) => s.partyId === "palestinian"),
  };

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
            <h2 className="text-2xl font-bold text-gray-900">
              {solutionsSection?.heading}
            </h2>
          )}

          {solutionsSection?.paragraphs?.map((paragraph, index) => (
            <p key={index} className="text-gray-700 mt-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-8 md:gap-0">
            <h2 className="text-2xl font-bold">
              {solutionsSection?.subheading}
            </h2>
            <div className="flex w-full md:w-auto items-end">
              {addSolutionButton()}
            </div>
          </div>

          {/* View Toggle */}
          {solutions.length > 0 && (
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

              <div className="flex gap-4 text-sm">
                {Object.entries(partyConfig).map(([key, config]) => {
                  const maxPerParty = Math.floor(10 / 2); // 5 per party
                  const currentCount = partyCounts[key as PartyId] || 0;

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
                {/* <div className="text-gray-500 text-xs">
                  Total: {partyCounts.total}/10
                </div> */}
              </div>
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
              <div className="mt-4">{addSolutionButton()}</div>
            </div>
          ) : viewMode === "mixed" ? (
            <div className="space-y-6">
              {sortedSolutions.map((solution, index) => (
                <div key={solution.id} className="relative">
                  {newlyCreatedSolutionId === solution.id && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge className="bg-green-500 text-white animate-pulse">
                        New!
                      </Badge>
                    </div>
                  )}
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
                    index={index}
                    toggleExpand={toggleExpand}
                    onRefresh={refreshSolutions}
                    showPartyBadge={true}
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
                        className={`${partyConfig[partyId as PartyId].color} text-base px-3 py-1`}
                      >
                        <span className="mr-2">
                          {partyConfig[partyId as PartyId].icon}
                        </span>
                        {partyConfig[partyId as PartyId].label}
                      </Badge>
                      <span className="text-gray-500">
                        ({solutionList.length} solutions)
                      </span>
                    </div>
                    <div className="space-y-4">
                      {solutionList.map((solution, index) => (
                        <div key={solution.id} className="relative">
                          {newlyCreatedSolutionId === solution.id && (
                            <div className="absolute top-2 right-2 z-20">
                              <Badge className="bg-green-500 text-white animate-pulse">
                                New!
                              </Badge>
                            </div>
                          )}
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
                            index={sortedSolutions.findIndex(
                              (s) => s.id === solution.id
                            )}
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
          <DialogContent className="sm:max-w-lg">
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
                  I want to direct my solution to
                </Label>
                <RadioGroup
                  value={newSolution.partyId}
                  onValueChange={(value: PartyId) =>
                    setNewSolution({ ...newSolution, partyId: value })
                  }
                  className="mt-2"
                >
                  {Object.entries(partyConfig).map(([key, config]) => {
                    const maxPerParty = Math.floor(10 / 2); // 5 per party
                    const currentCount = partyCounts[key as PartyId] || 0;
                    const isDisabled = currentCount >= maxPerParty;

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={key}
                            id={key}
                            disabled={isDisabled}
                            className={
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }
                          />
                          <Label
                            htmlFor={key}
                            className={`flex items-center gap-2 font-medium ${
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
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
        <DialogContent className="max-w-lg w-full max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                To add a solution you must login
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => {
                setShowLoginModal(false);
                setIsCreateSolutionOpen(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
