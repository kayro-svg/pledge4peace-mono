import CommentsSection from "@/components/campaign/comments/comments-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getCampaignSolutionById } from "@/lib/api";
import { Solution } from "@/lib/types";

interface SidebarSectionProps {
  solutionId?: string;
}

export default function SidebarSection({ solutionId }: SidebarSectionProps) {
  const [solution, setSolution] = useState<Solution | null>(null);

  useEffect(() => {
    async function fetchSolution() {
      try {
        if (solutionId) {
          const solution = await getCampaignSolutionById(solutionId);
          setSolution(solution);
        }
      } catch (error) {
        console.error("Error fetching solution:", error);
      }
    }
    fetchSolution();
  }, [solutionId]);

  return (
    <div className="bg-white rounded-3xl shadow-[0_0_10px_rgba(0,0,0,0.1)] p-6 flex flex-col max-h-[88vh] overflow-y-auto">
      <div className="flex flex-col gap-4 mb-4">
        <p className="text-lg font-bold leading-tight">
          {solution?.title ||
            "Select a solution to view comments and add your thoughts"}
        </p>
        {solutionId && (
          <p className="text-sm text-gray-500">
            Share your thoughts on the solution and help us make it better.
          </p>
        )}
      </div>

      <CommentsSection solutionId={solutionId} />
    </div>
  );
}
