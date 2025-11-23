import VerifyReviewPage from "@/components/verify-review/verify-review-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyReviewPage />
    </Suspense>
  );
}

