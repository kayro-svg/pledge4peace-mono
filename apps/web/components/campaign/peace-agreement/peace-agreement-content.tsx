"use client";

import { Button } from "@/components/ui/button";
import { getCampaignBySlug } from "@/lib/sanity/queries";
import {
  CampaignWithSolutions,
  PartySolutions,
  SanitySolutionsSection,
} from "@/lib/types";
import { BadgeCheck, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import SolutionActionsBar from "./solution-actions-bar";

interface PeaceAgreementContentProps {
  solutionsSection: SanitySolutionsSection;
  campaignSlug?: string;
  onSolutionChange?: (solutionId: string) => void;
  activeSolutionId?: string;
}

export default function PeaceAgreementContent({
  campaignSlug,
  onSolutionChange,
  activeSolutionId,
  solutionsSection,
}: PeaceAgreementContentProps) {
  // const [campaign, setCampaign] = useState<CampaignWithSolutions | null>(null);
  const [partySolutions, setPartySolutions] = useState<PartySolutions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleExpand = (partyId: string, solutionId: string) => {
    setPartySolutions(
      partySolutions.map((party) => {
        if (party.id === partyId) {
          return {
            ...party,
            solutions: party.solutions.map((solution) =>
              solution.id === solutionId
                ? { ...solution, expanded: !solution.expanded }
                : solution
            ),
          };
        }
        return party;
      })
    );

    if (onSolutionChange) {
      onSolutionChange(solutionId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic content section */}
      <div className="prose max-w-none">
        {solutionsSection.heading && (
          <h2 className="text-2xl font-bold text-gray-900">
            {solutionsSection.heading}
          </h2>
        )}

        {solutionsSection.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-700 mt-4">
            {paragraph}
          </p>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          Vote Below on Solutions to {solutionsSection.subheading}
        </h2>

        {/* <div className="space-y-8">
          {partySolutions.map((party) => (
            <div key={party.id} className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{party.name}</h3>
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-sm text-gray-500">
                    Party #{party.partyNumber}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white rounded-full"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add deliverable
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {party.solutions.map((solution) => (
                  <div
                    key={solution.id}
                    className={`border ${
                      solution.id === activeSolutionId
                        ? "border-[#2F4858] ring-2 ring-[#2F4858]/20"
                        : "border-gray-200"
                    } hover:border-[#2F4858] hover:ring-2 hover:ring-[#2F4858]/20 rounded-2xl overflow-hidden bg-white transition-all`}
                    onClick={() => {
                      if (
                        onSolutionChange &&
                        solution.id !== activeSolutionId
                      ) {
                        onSolutionChange(solution.id);
                      }
                    }}
                  >
                    <div className="border-t p-6 border-gray-100 gap-3 flex flex-col">
                      <div className="flex flex-col gap-0">
                        <div className="flex items-start gap-2">
                          <div className="bg-gray-100 p-1 rounded">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-600"
                            >
                              <path d="M12 20V10" />
                              <path d="M18 20V4" />
                              <path d="M6 20v-6" />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-600">
                            {solution.rank}
                          </div>
                        </div>

                        <h4 className="text-lg font-semibold">
                          {solution.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => toggleExpand(party.id, solution.id)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        {solution.expanded ? (
                          <>
                            Read less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>

                      {solution.expanded && solution.details && (
                        <div className="mt-4 space-y-4">
                          <p className="text-gray-700">
                            {solution.details.intro}
                          </p>

                          <div className="space-y-4">
                            {solution.details.guidelines.map(
                              (guideline, idx) => (
                                <div key={idx}>
                                  <p className="font-semibold text-gray-800">
                                    {guideline.title}
                                  </p>
                                  <p className="text-gray-700">
                                    {guideline.description}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <SolutionActionsBar solutionId={solution.id} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
