"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";

type CommunityReviewButtonProps = {
  companyId: string;
  companyName: string;
};

export function CommunityReviewButton({
  companyId,
  companyName,
}: CommunityReviewButtonProps) {
  const router = useRouter();
  const { session } = useAuthSession();

  const handleClick = () => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    // Redirect to community review flow
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
