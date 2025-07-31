"use client";

import { useState } from "react";
import { InvolvementStats } from "@/components/dashboard/involvement/involvement-stats";
import { ActivityHistory } from "@/components/dashboard/involvement/activity-history";
import { CommentariesHistory } from "@/components/dashboard/involvement/comentaries-history";

export default function InvolvementContent() {
  const [showAllVotes, setShowAllVotes] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAllUpvotes, setShowAllUpvotes] = useState(false);
  const [showAllDownvotes, setShowAllDownvotes] = useState(false);

  // Función para resetear todos los filtros
  const resetAllFilters = () => {
    setShowAllVotes(false);
    setShowAllComments(false);
    setShowAllUpvotes(false);
    setShowAllDownvotes(false);
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <InvolvementStats
              setShowAllVotes={setShowAllVotes}
              setShowAllComments={setShowAllComments}
              setShowAllUpvotes={setShowAllUpvotes}
              setShowAllDownvotes={setShowAllDownvotes}
              resetAllFilters={resetAllFilters}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <ActivityHistory
              showAllVotes={showAllVotes}
              showAllComments={showAllComments}
              showAllUpvotes={showAllUpvotes}
              showAllDownvotes={showAllDownvotes}
              resetAllFilters={resetAllFilters}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <CommentariesHistory />
          </div>
        </div>
      </div>
    </>
  );
}
