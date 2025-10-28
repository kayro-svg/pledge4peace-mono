"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
// Community reviews support anonymous submissions per requirements

type CommunityReviewButtonProps = {
  companyId: string;
  companyName: string;
  setShowLoginModal?: (show: boolean) => void; // Optional since login not required
};

export function CommunityReviewButton({
  companyId,
  companyName,
  setShowLoginModal: _setShowLoginModal, // Unused since login not required
}: CommunityReviewButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Community reviews support anonymous submissions per requirements
    // No authentication required
    router.push(
      `/peace-seal/community-review?companyId=${companyId}&companyName=${encodeURIComponent(companyName)}`
    );
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-[#548281] hover:bg-[#2F4858] text-white"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Write a Review
    </Button>
  );
}
