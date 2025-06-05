"use client";

import AuthContainer from "@/components/login/auth-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSolutions, getUserInteractions } from "@/lib/api/solutions";
import { API_ENDPOINTS, API_URL } from "@/lib/config";
import { SanitySolutionsSection, Solution } from "@/lib/types";
import { Loader2, Plus, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInteractions } from "../shared/interaction-context";
import SolutionPost from "./solution-post";

interface PeaceAgreementContentProps {
  campaignId: string;
  solutionsSection: SanitySolutionsSection;
  campaignSlug?: string;
  onSolutionChange?: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  activeSolutionId?: string;
}

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
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [solutionStats, setSolutionStats] = useState<Record<string, any>>({});
  const router = useRouter();
  const { setUserInteraction } = useInteractions();

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
              console.warn(
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
            setUserInteraction("like", solutionId, interactions.hasLiked);
            setUserInteraction("dislike", solutionId, interactions.hasDisliked);
            setUserInteraction("share", solutionId, interactions.hasShared);
          });
        }
      } catch (error) {
        console.error("Error fetching solutions:", error);
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create solution");
      }

      const createdSolution = await response.json();
      setSolutions((prev) => [...prev, createdSolution]);
      setIsCreateSolutionOpen(false);
      setNewSolution({ title: "", description: "" });
      toast.success("Solution created successfully");
    } catch (error) {
      console.error("Error creating solution:", error);
      toast.error("Failed to create solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSolutionButton = () => {
    if (solutions.length >= 5) {
      return null;
    } else {
      return (
        <Button
          onClick={() => {
            if (!session) {
              setShowLoginModal(true);
              return;
            }
            setIsCreateSolutionOpen(true);
          }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          {session ? (
            <Plus className="h-4 w-4" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {session ? "Add Solution" : "Sign in to add a solution"}
        </Button>
      );
    }
  };

  // Sort solutions by likes in descending order
  const sortedSolutions = [...solutions].sort((a, b) => {
    const aLikes = solutionStats[a.id]?.likes || 0;
    const bLikes = solutionStats[b.id]?.likes || 0;
    return bLikes - aLikes;
  });

  // Update solutions when stats change
  useEffect(() => {
    if (solutions.length > 0 && Object.keys(solutionStats).length > 0) {
      const updatedSolutions = [...solutions].sort((a, b) => {
        const aLikes = solutionStats[a.id]?.likes || 0;
        const bLikes = solutionStats[b.id]?.likes || 0;
        return bLikes - aLikes;
      });
      setSolutions(updatedSolutions);
    }
  }, [solutionStats, solutions.length]);

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
              {/* Vote Below on Solutions to {solutionsSection.subheading} */}
              {solutionsSection?.subheading}
            </h2>
            <div className="flex w-full md:w-auto items-end">
              {solutions.length > 0 && addSolutionButton()}
            </div>
          </div>

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
              {addSolutionButton()}
              {/* <Button
                onClick={() => {
                  if (!session) {
                    setShowLoginModal(true);
                    return;
                  }
                  setIsCreateSolutionOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Solution
              </Button> */}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedSolutions.map((solution, index) => (
                <SolutionPost
                  key={solution.id}
                  rank={index + 1}
                  solution={{
                    ...(solution as any),
                    partyId: (solution as any).partyId ?? "",
                    likes:
                      (solution as any).likes ??
                      solutionStats[solution.id]?.likes ??
                      0,
                    comments:
                      (solution as any).comments ??
                      solutionStats[solution.id]?.comments ??
                      0,
                    stats: solutionStats[solution.id] || {
                      likes: 0,
                      dislikes: 0,
                      shares: 0,
                      comments: 0,
                    },
                  }}
                  onCommentClick={onCommentClick}
                  activeSolutionId={activeSolutionId || ""}
                  onSolutionChange={onSolutionChange || (() => {})}
                  index={index}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={isCreateSolutionOpen}
          onOpenChange={setIsCreateSolutionOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Solution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSolution} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
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
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
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
