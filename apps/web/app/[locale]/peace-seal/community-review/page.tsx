"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CommunityReviewFlow } from "@/components/peace-seal/community-review-flow/community-review-flow";
import { useAuthSession } from "@/hooks/use-auth-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function CommunityReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useAuthSession();

  const companyId = searchParams.get("companyId");
  const companyName = searchParams.get("companyName");

  // Redirect if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to submit a community review.
            </p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if missing parameters
  if (!companyId || !companyName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Request</h2>
            <p className="text-gray-600 mb-4">
              Missing company information. Please try again from the directory.
            </p>
            <Button onClick={() => router.push("/peace-seal")}>
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleComplete = () => {
    router.push("/peace-seal/directory");
  };

  const handleCancel = () => {
    router.push("/peace-seal/directory");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityReviewFlow
        companyId={companyId}
        companyName={companyName}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
