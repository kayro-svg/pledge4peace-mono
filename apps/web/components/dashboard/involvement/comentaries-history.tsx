import { Button } from "@/components/ui/button";
import { CommentHistoryCard } from "./comment-history-card";
import { ChevronRight } from "lucide-react";

const userComments = [
  {
    title: "Strengthen Democracy & Accountability within Political Parties",
    comment:
      "I believe this solution is fundamental for democratic development. We need more transparent and accountable political parties that account to citizens and not to private interests.",
    date: "3 days ago",
    likes: 12,
    replies: 3,
    solution: {
      category: "Democracy",
      rank: 1,
    },
  },
  {
    title:
      "Land Reforms, Eliminate Mafias, and Redistribute Resources in Pakistan",
    comment:
      "The redistribution of resources is key to reducing inequality, but it must be done with a solid legal framework that prevents corruption and ensures that benefits reach those who need them most.",
    date: "1 week ago",
    likes: 8,
    replies: 1,
    solution: {
      category: "Peace",
      rank: 2,
    },
  },
  {
    title: "Implement Nationwide Education Reform",
    comment:
      "Education is the foundation of development. This reform should prioritize universal access and quality education, especially in rural and marginalized communities where access to education is limited.",
    date: "2 weeks ago",
    likes: 15,
    replies: 5,
    solution: {
      category: "Democracy",
      rank: 3,
    },
  },
];

export function CommentariesHistory() {
  return (
    <div className="py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Recent Comments
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Your latest comments on solutions
          </p>
        </div>
        {/* <Button
          variant="outline"
          className="gap-2 rounded-full border-[#2f4858] text-[#2f4858]"
        >
          View All Comments <ChevronRight className="h-4 w-4" />
        </Button> */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userComments.map((comment, index) => (
          <CommentHistoryCard key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
}
