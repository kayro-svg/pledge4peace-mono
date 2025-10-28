"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Building,
  Globe,
  Users,
  Info,
  AlertTriangle,
  CheckCircle2,
  Flag,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityReviewButton } from "@/components/peace-seal/community-review-button";
import { getStatusLabel, getStatusClasses } from "@/lib/peace-seal/status";
import type { Company, CommunityReview } from "@/lib/api/peace-seal";
import { useAuthSession } from "@/hooks/use-auth-session";
import AuthContainer from "@/components/login/auth-container";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type PublicCompanyProfileProps = {
  company: Company;
  reviews: CommunityReview[];
};

/** Estado helpers */
const isApproved = (s: string) => s === "verified";
const isDenied = (s: string) => s === "did_not_pass";
const isInProgress = (s: string) =>
  s === "application_submitted" ||
  s === "audit_in_progress" ||
  s === "under_review";
const isCommunityListed = (company: Company) => company.communityListed === 1;

function StarRating({
  rating,
  count,
}: {
  rating?: number | null;
  count?: number | null;
}) {
  if (!rating || !count)
    return <span className="text-gray-400 text-sm">No ratings yet</span>;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-2">({count} reviews)</span>
    </div>
  );
}

function ReviewItem({ review }: { review: CommunityReview }) {
  const isVerified = review.verificationStatus === "verified";
  const isPending = review.verificationStatus === "unverified";

  console.log("review", review);

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              isVerified ? "default" : isPending ? "secondary" : "outline"
            }
          >
            {isVerified
              ? "✓ Verified"
              : isPending
                ? "Unverified"
                : "Unverified"}{" "}
            {review.role}
          </Badge>
          {review.starRating && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.starRating!
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.totalScore && (
        <p className="text-sm text-gray-600">Score: {review.totalScore}/100</p>
      )}
      {review.experienceDescription && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">
            Comment from reviewer:
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {review.experienceDescription}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PublicCompanyProfile({
  company,
  reviews,
}: PublicCompanyProfileProps) {
  console.log("company", company);
  console.log("reviews", reviews);

  const companyCreatedAt = (() => {
    const n = Number(company.createdAt);
    const date = new Date(n > 1e12 ? n : n * 1000);
    return date.toLocaleDateString();
  })();

  const { isAuthenticated } = useAuthSession();
  const router = useRouter();
  const hasScore = company.score !== null && company.score !== undefined;
  const hasNotes = Boolean(company.notes && company.notes.trim().length > 0);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      router.push(`/peace-seal/report/${company.slug}`);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/peace-seal/directory"
              className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Link>
          </div>

          {/* Company Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2F4858] to-[#548281] px-6 py-8 text-white">
              <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
              <div className="flex items-center gap-4 text-sm opacity-90">
                {company.country && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {company.country}
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {company.industry}
                  </div>
                )}
                {company.employeeCount && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {company.employeeCount} employees
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Community Review Button */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-4 justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      {isCommunityListed(company)
                        ? "Community Listing Status"
                        : "Peace Seal Status"}
                    </h2>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full border ${
                        isCommunityListed(company)
                          ? "border-blue-200 bg-blue-50 text-blue-800"
                          : getStatusClasses(company.status)
                      }`}
                    >
                      <span className="font-medium">
                        {isCommunityListed(company)
                          ? "Community Listed"
                          : getStatusLabel(company.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex justify-end">
                    <CommunityReviewButton
                      companyId={company.id}
                      companyName={company.name}
                      setShowLoginModal={setShowLoginModal}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-700 border-red-500 hover:bg-red-50 hover:border-red-700"
                      aria-label="Report an issue"
                      onClick={handleReportClick}
                    >
                      <Flag className="h-4 w-4" aria-hidden="true" />
                      Report this company
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                {/* Mensajes claros por estado */}
                {isCommunityListed(company) && (
                  <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800">
                    <Info className="w-5 h-5 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">
                        This company was added to our community directory for
                        reviews.
                      </p>
                      <p className="mt-1">
                        This company has not applied for Peace Seal
                        certification. It was added by community members who
                        wanted to review and rate the company. Community reviews
                        help provide transparency about company practices.
                      </p>
                      {company.createdAt && (
                        <p className="mt-2">
                          Added to directory:{" "}
                          <strong>{companyCreatedAt}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!isCommunityListed(company) && isApproved(company.status) && (
                  <div className="mt-4 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">
                        The company is certified with the Peace Seal.
                      </p>
                      <p className="mt-1">
                        The company meets ethical practices, nonviolence, social
                        impact, and transparent governance standards.
                      </p>
                    </div>
                  </div>
                )}

                {!isCommunityListed(company) &&
                  isInProgress(company.status) && (
                    <div className="mt-4 flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                      <Info className="w-5 h-5 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">
                          The company is under review.
                        </p>
                        <p className="mt-1">
                          The company is still under review. Current status:{" "}
                          <strong>{getStatusLabel(company.status)}</strong>
                          {company.createdAt && (
                            <>
                              {" · "}Application date:{" "}
                              <strong>
                                {new Date(
                                  company.createdAt
                                ).toLocaleDateString()}
                              </strong>
                            </>
                          )}
                          {company.lastReviewedAt && (
                            <>
                              {" · "}Last review:{" "}
                              <strong>
                                {new Date(
                                  company.lastReviewedAt
                                ).toLocaleDateString()}
                              </strong>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                {!isCommunityListed(company) && isDenied(company.status) && (
                  <div className="mt-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">
                        The company did not pass the audit.
                      </p>
                      <p className="mt-1">
                        Current status: <strong>Did Not Pass Audit</strong>. You
                        can reapply when you resolve the observations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Information
                  </h3>

                  {company.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors break-all"
                      >
                        {company.website}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isCommunityListed(company)
                        ? "Added to Directory"
                        : "Application Date"}
                    </label>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {companyCreatedAt}
                    </div>
                  </div>

                  {company.lastReviewedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Reviewed
                      </label>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        {new Date(company.lastReviewedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit Information / Community */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isCommunityListed(company)
                      ? "Community Information"
                      : "Audit Information"}
                  </h3>

                  {isCommunityListed(company) ? (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                      <p className="font-medium mb-2">
                        Community Listed Company
                      </p>
                      <p>
                        This company was added to our community directory for
                        reviews and ratings. It has not undergone the Peace Seal
                        certification process.
                      </p>
                      {(company.employeeRatingCount || 0) > 0 && (
                        <p className="mt-2">
                          Community reviews:{" "}
                          <strong>{company.employeeRatingCount || 0}</strong>{" "}
                          employee reviews,
                          <strong>
                            {" "}
                            {company.overallRatingCount || 0}
                          </strong>{" "}
                          overall reviews
                        </p>
                      )}
                    </div>
                  ) : isApproved(company.status) ? (
                    <>
                      {hasScore && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Audit Score
                          </label>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {company.score}
                            </div>
                            <div className="text-sm text-gray-500 ml-2">
                              / 100
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-[#548281] h-2 rounded-full transition-all"
                              style={{ width: `${company.score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {hasNotes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                            {company.notes}
                          </p>
                        </div>
                      )}

                      {!hasScore && !hasNotes && (
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                          There are no public audit details. The certification
                          is active.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                      {company.notes ||
                        "There are no audit details for this status."}
                    </div>
                  )}
                </div>
              </div>

              {/* Community Ratings */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Community Ratings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Employee Rating
                    </h3>
                    <StarRating
                      rating={company.employeeRatingAvg}
                      count={company.employeeRatingAvg}
                    />
                  </div> */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Overall Rating
                    </h3>
                    <StarRating
                      rating={company.overallRatingAvg}
                      count={company.employeeRatingAvg}
                    />
                  </div>
                </div>
              </div>

              {/* Reviews Tab */}
              {reviews.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Community Reviews
                  </h2>
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {/* Badge final si aprobado */}
              {isApproved(company.status) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-600 flex justify-center mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Peace Seal Certified
                  </h3>
                  <p className="text-green-700">
                    This company has been verified and awarded the Peace Seal
                    for their commitment to ethical practices, nonviolence,
                    social impact, and transparent governance.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 text-center">
                {isCommunityListed(company) ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Want to help this company get Peace Seal certified?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/peace-seal/apply"
                        className="inline-flex items-center bg-[#548281] text-white px-6 py-3 rounded-md hover:bg-[#2F4858] transition-colors"
                      >
                        Apply for Peace Seal certification
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center border border-[#548281] text-[#548281] px-6 py-3 rounded-md hover:bg-[#548281] hover:text-white transition-colors"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/peace-seal/apply"
                    className="inline-flex items-center bg-[#548281] text-white px-6 py-3 rounded-md hover:bg-[#2F4858] transition-colors"
                  >
                    Apply for your Peace Seal certification
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-lg w-full max-h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                To review this company you must login
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => setShowLoginModal(false)}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
