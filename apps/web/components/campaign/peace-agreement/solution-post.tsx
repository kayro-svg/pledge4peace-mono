import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import SolutionActionsBar from "./solution-actions-bar";
import { SanitySolution } from "@/lib/types";

interface SolutionPostProps {
  solution: SanitySolution;
  activeSolutionId: string;
  onSolutionChange: (solutionId: string) => void;
  index: number;
}

export default function SolutionPost({
  solution,
  activeSolutionId,
  onSolutionChange,
  index,
}: SolutionPostProps) {
  return (
    <div
      className={`border ${
        index === activeSolutionId
          ? "border-[#2F4858] ring-2 ring-[#2F4858]/20"
          : "border-gray-200"
      } hover:border-[#2F4858] hover:ring-2 hover:ring-[#2F4858]/20 rounded-2xl overflow-hidden bg-white transition-all`}
      onClick={() => {
        if (onSolutionChange && solution.id !== activeSolutionId) {
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
            <div className="text-sm text-gray-600">{solution.rank}</div>
          </div>

          <h4 className="text-lg font-semibold">{solution.title}</h4>
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
            <p className="text-gray-700">{solution.details.intro}</p>

            <div className="space-y-4">
              {solution.details.guidelines.map((guideline, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-gray-800">
                    {guideline.title}
                  </p>
                  <p className="text-gray-700">{guideline.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SolutionActionsBar solutionId={solution.id} />
    </div>
  );
}
