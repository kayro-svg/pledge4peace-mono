"use client";

import { DirectoryItem } from "@/lib/api/peace-seal";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  createOrFindCompany,
  type CreateCompanyData,
} from "@/lib/api/peace-seal";
import { Star, Loader2 } from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";
import AuthContainer from "@/components/login/auth-container";

type DirectoryPageProps = {
  items: DirectoryItem[];
  q: string;
  country: string;
  status: string;
};

export function getStatusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Peace Seal Verified";
    case "conditional":
      return "Conditional Seal";
    case "did_not_pass":
      return "Did Not Pass Audit";
    case "under_review":
      return "Seal Under Review";
    case "audit_in_progress":
      return "Audit in Progress";
    // case "draft":
    //   return "Draft Application";
    case "application_submitted":
    default:
      return "Application Submitted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "verified":
      return "text-green-600 bg-green-50";
    case "conditional":
      return "text-orange-600 bg-orange-50";
    case "did_not_pass":
      return "text-red-600 bg-red-50";
    case "under_review":
      return "text-yellow-600 bg-yellow-50";
    case "audit_in_progress":
      return "text-blue-600 bg-blue-50";
    // case "draft":
    //   return "text-gray-400 bg-gray-100";
    case "application_submitted":
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function StarRating({
  rating,
  count,
}: {
  rating?: number | null;
  count?: number | null;
}) {
  if (!rating || !count)
    return <span className="text-gray-400 text-sm">Pending</span>;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({count})</span>
    </div>
  );
}

export function DirectoryPage({
  items,
  q,
  country,
  status,
}: DirectoryPageProps) {
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuthSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addForCommunityReview, setAddForCommunityReview] = useState(false);
  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data: CreateCompanyData = {
        name: formData.get("name") as string,
        website: (formData.get("website") as string) || undefined,
        country: (formData.get("country") as string) || undefined,
        industry: (formData.get("industry") as string) || undefined,
      };

      const result = await createOrFindCompany(data);

      toast({
        title: "Company added successfully",
        description:
          "Now let's get your review of this company to help the community.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();

      // Redirect to community review flow
      router.push(
        `/peace-seal/community-review?companyId=${result.company.id}&companyName=${encodeURIComponent(result.company.name)}`
      );

      // Close modal after successful redirect
      setIsAddCompanyOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error adding company",
        description: (error as Error).message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2F4858] mb-4">
          Peace Seal Directory
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Discover businesses committed to ethical practices, nonviolence,
          social impact, and transparent governance. The Peace Seal is awarded
          to companies that demonstrate good practices in the workplace and
          commitment to global peace.
        </p>
      </div>

      {/* Search and Filter Form */}
      <form method="GET" className="mb-8 bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="q"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Company
            </label>
            <input
              id="q"
              name="q"
              type="text"
              placeholder="Company name..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#548281]"
              defaultValue={q || ""}
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Country..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#548281]"
              defaultValue={country || ""}
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#548281]"
              defaultValue={status || ""}
            >
              <option value="">All Statuses</option>
              {/* <option value="draft">Draft Application</option> */}
              <option value="application_submitted">
                Application Submitted
              </option>
              <option value="audit_in_progress">Audit in Progress</option>
              <option value="verified">Peace Seal Verified</option>
              <option value="conditional">Conditional Seal</option>
              <option value="did_not_pass">Did Not Pass Audit</option>
              <option value="under_review">Seal Under Review</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#548281] text-white px-4 py-2 rounded-md hover:bg-[#2F4858] transition-colors"
            >
              Filter Results
            </button>
          </div>
        </div>
      </form>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peace Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Reviewed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Community Rating
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating by Employees
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/peace-seal/company/${item.slug}`}
                      className="text-[#548281] hover:text-[#2F4858] font-medium underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.country || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.lastReviewedAt
                      ? new Date(item.lastReviewedAt).toLocaleDateString()
                      : "Pending"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StarRating
                      rating={item.employeeRatingAvg}
                      count={item.employeeRatingAvg}
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={6}
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium mb-2">
                        No companies found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search criteria or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">
          Add your company to the directory.
          <Link
            href="#"
            onClick={() => {
              if (!isAuthenticated) {
                setShowLoginModal(true);
              } else {
                router.push("/peace-seal/apply");
              }
            }}
            className="ml-2 text-[#548281] hover:underline"
          >
            Apply for a Peace Seal certification →
          </Link>
        </p>
      </div>
      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-600">
        <p className="text-sm">
          Can&apos;t find the company you work for?
          <Dialog
            open={isAddCompanyOpen}
            onOpenChange={(open) => {
              if (!isAuthenticated) {
                setAddForCommunityReview(true);
                setShowLoginModal(true);
              } else {
                setIsAddCompanyOpen(open);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="ml-2 text-[#548281] hover:underline p-0 h-auto"
              >
                Add them to the directory →
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[60vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Company to Directory</DialogTitle>
              </DialogHeader>
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#548281]" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Adding Company...
                    </h3>
                    <p className="text-sm text-gray-600">
                      Please wait while we add the company to the directory and
                      prepare your review.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddCompanyOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#548281] hover:bg-[#2F4858]"
                    >
                      {isSubmitting ? "Adding..." : "Add Company"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
            {/* <DialogContent className="max-w-lg w-full max-h-[80vh] md:max-h-[85%]"> */}
            <DialogContent className="max-w-lg w-full h-[80vh] md:h-[fit-content]">
              <DialogHeader>
                <DialogTitle>
                  <p className="text-lg font-semibold mb-4 text-center">
                    To apply for a Peace Seal you must login
                  </p>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <AuthContainer
                  onLoginSuccess={() => {
                    setShowLoginModal(false);
                    if (addForCommunityReview) {
                      setIsAddCompanyOpen(true);
                    } else {
                      router.push("/peace-seal/apply");
                    }
                  }}
                  isModal
                  preSelectedUserType="organization"
                />
              </div>
            </DialogContent>
          </Dialog>
        </p>
      </div>
    </div>
  );
}
