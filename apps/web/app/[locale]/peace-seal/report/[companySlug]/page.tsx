import ReportClient from "@/components/peace-seal/report-page/report-page";
import { getReportReasons, getCompanyBySlug } from "@/lib/api/peace-seal";

type Props = { params: { locale: string; companySlug: string } };

export default async function Page({ params }: Props) {
  const { locale, companySlug } = params;

  const [reasons, company] = await Promise.all([
    getReportReasons(),
    getCompanyBySlug(companySlug).catch(() => null),
  ]);

  const backHref = company
    ? `/${locale}/peace-seal/company/${company.slug}`
    : `/${locale}/peace-seal/directory`;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <ReportClient
          locale={locale}
          reasons={reasons}
          company={
            company
              ? { id: company.id, name: company.name, slug: company.slug }
              : null
          }
          backHref={backHref}
        />
      </div>
    </main>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import {
//   submitPublicReport,
//   getReportReasons,
//   getCompanyBySlug,
//   type ReportData,
//   type ReportReasons,
// } from "@/lib/api/peace-seal";
// import { AlertTriangle, Flag, ArrowLeft } from "lucide-react";
// import Link from "next/link";

// interface ReportPageProps {
//   params: Promise<{
//     companySlug: string;
//   }>;
// }

// export default function ReportPage({ params }: ReportPageProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [companyId, setCompanyId] = useState<string>("");
//   const [companyName, setCompanyName] = useState<string>("");
//   const [companySlug, setCompanySlug] = useState<string>("");
//   const [reasons, setReasons] = useState<ReportReasons | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [formData, setFormData] = useState<ReportData>({
//     companyId: "",
//     reporterEmail: "",
//     reporterName: "",
//     reason: "",
//     description: "",
//     evidence: "",
//   });

//   // Load params and company data
//   useEffect(() => {
//     async function loadData() {
//       try {
//         const resolvedParams = await params;
//         const slug = resolvedParams.companySlug;

//         // Load reasons and company info in parallel
//         const [reasonsData, companyData] = await Promise.all([
//           getReportReasons(),
//           // Try to get company by ID (assuming it's a slug)
//           getCompanyBySlug(slug).catch(() => null),
//         ]);

//         setReasons(reasonsData);

//         if (companyData) {
//           setCompanyName(companyData.name);
//           setCompanySlug(companyData.slug);
//           setCompanyId(companyData.id);
//           setFormData((prev) => ({ ...prev, companyId: companyData.id }));
//         }
//       } catch (error) {
//         console.error("Error loading report data:", error);
//         toast({
//           title: "Error loading page",
//           description: "Please try again later.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, [params, toast]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.reason) {
//       toast({
//         title: "Please select a reason for the report",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!formData.description?.trim()) {
//       toast({
//         title: "Please provide a description of the issue",
//         variant: "destructive",
//       });
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await submitPublicReport({
//         ...formData,
//         companyId: companyId,
//         description: formData.description?.trim(),
//         evidence: formData.evidence?.trim() || undefined,
//       });

//       toast({
//         title: "Report submitted successfully",
//         description:
//           "Thank you for your report. It will be reviewed by our team.",
//       });

//       // Redirect to company page or directory
//       if (companySlug) {
//         router.push(`/peace-seal/company/${companySlug}`);
//       } else {
//         router.push("/peace-seal/directory");
//       }
//     } catch (error: any) {
//       console.error("Error submitting report:", error);
//       toast({
//         title: "Failed to submit report",
//         description: error.message || "Please try again later.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281] mx-auto"></div>
//           <p className="mt-2 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-2xl">
//         {/* Header */}
//         <div className="mb-6">
//           <Link
//             href={
//               companySlug
//                 ? `/peace-seal/company/${companySlug}`
//                 : "/peace-seal/directory"
//             }
//             className="inline-flex items-center text-[#548281] hover:text-[#2F4858] mb-4"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to {companyName ? companyName : "Directory"}
//           </Link>

//           <div className="flex items-center gap-3 mb-2">
//             <Flag className="w-6 h-6 text-red-500" />
//             <h1 className="text-2xl font-bold text-gray-900">
//               Report an Issue
//             </h1>
//           </div>

//           {companyName && (
//             <p className="text-gray-600">
//               Reporting an issue with:{" "}
//               <span className="font-medium">{companyName}</span>
//             </p>
//           )}
//         </div>

//         {/* Warning Notice */}
//         <Card className="mb-6 border-orange-200 bg-orange-50">
//           <CardContent className="pt-6">
//             <div className="flex items-start gap-3">
//               <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
//               <div className="text-sm text-orange-800">
//                 <p className="font-medium mb-1">Important Notice</p>
//                 <p>
//                   Please only submit reports for legitimate concerns about
//                   companies with Peace Seal certification. False or malicious
//                   reports may result in restrictions. All reports are reviewed
//                   by our team.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Report Form */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Report Details</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Reporter Information (Optional) */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">
//                   Your Information (Optional)
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Providing your contact information helps us follow up if
//                   needed, but it's not required.
//                 </p>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="reporterName">Your Name</Label>
//                     <Input
//                       id="reporterName"
//                       type="text"
//                       value={formData.reporterName || ""}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           reporterName: e.target.value,
//                         }))
//                       }
//                       placeholder="Optional"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="reporterEmail">Your Email</Label>
//                     <Input
//                       id="reporterEmail"
//                       type="email"
//                       value={formData.reporterEmail || ""}
//                       onChange={(e) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           reporterEmail: e.target.value,
//                         }))
//                       }
//                       placeholder="Optional"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Report Details */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">Report Details</h3>

//                 <div>
//                   <Label htmlFor="reason">Reason for Report *</Label>
//                   <Select
//                     value={formData.reason}
//                     onValueChange={(value) =>
//                       setFormData((prev) => ({ ...prev, reason: value }))
//                     }
//                     required
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a reason" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {reasons &&
//                         Object.entries(reasons).map(([key, label]) => (
//                           <SelectItem key={key} value={key}>
//                             {label}
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="description">Description *</Label>
//                   <Textarea
//                     id="description"
//                     value={formData.description || ""}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         description: e.target.value,
//                       }))
//                     }
//                     placeholder="Please provide detailed information about the issue..."
//                     rows={5}
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Please be specific and provide as much detail as possible.
//                   </p>
//                 </div>

//                 <div>
//                   <Label htmlFor="evidence">
//                     Supporting Evidence (Optional)
//                   </Label>
//                   <Textarea
//                     id="evidence"
//                     value={formData.evidence || ""}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         evidence: e.target.value,
//                       }))
//                     }
//                     placeholder="Links to articles, documents, or other evidence..."
//                     rows={3}
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Include URLs, document references, or other supporting
//                     information.
//                   </p>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="pt-4 border-t">
//                 <div className="flex gap-4">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       if (companySlug) {
//                         router.push(`/peace-seal/company/${companySlug}`);
//                       } else {
//                         router.push("/peace-seal/directory");
//                       }
//                     }}
//                     disabled={submitting}
//                   >
//                     Cancel
//                   </Button>

//                   <Button
//                     type="submit"
//                     disabled={
//                       submitting ||
//                       !formData.reason ||
//                       !formData.description?.trim()
//                     }
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     {submitting ? "Submitting..." : "Submit Report"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
