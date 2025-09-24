import { getCompanyBySlug } from "@/lib/api/peace-seal";
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
} from "lucide-react";
import {
  getStatusLabel,
  getStatusColor,
} from "@/components/peace-seal/directory-page/directory-page";

export const revalidate = 0;

/** Helpers de estado */
const isApproved = (s: string) => s === "verified";
const isDenied = (s: string) => s === "did_not_pass";
const isInProgress = (s: string) =>
  s === "application_submitted" ||
  s === "audit_in_progress" ||
  s === "under_review";

export default async function CompanyProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompanyBySlug(params.slug);

  const hasScore = company.score !== null && company.score !== undefined;
  const hasNotes = Boolean(company.notes && company.notes.trim().length > 0);

  return (
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
            {/* Status */}
            <div className="mb-6">
              <div className="flex items-start gap-4 justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Peace Seal Status
                  </h2>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(
                      company.status
                    )}`}
                  >
                    <span className="font-medium">
                      {getStatusLabel(company.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative inline-block group">
                    <Link
                      className="text-red-500 hover:text-red-700"
                      aria-label="Report an issue"
                      href={`/peace-seal/report/${company.slug}`}
                    >
                      <Flag className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <span
                      role="tooltip"
                      className="pointer-events-none absolute top-full right-0 mt-1 z-50
              rounded bg-red-200 px-2 py-1 text-xs text-red-600 whitespace-nowrap
               opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
               transition duration-150 origin-top-right"
                    >
                      Report an issue
                    </span>
                  </div>
                </div>
              </div>

              {/* Mensajes claros por estado */}
              {isApproved(company.status) && (
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

              {isInProgress(company.status) && (
                <div className="mt-4 flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                  <Info className="w-5 h-5 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">The company is under review.</p>
                    <p className="mt-1">
                      The company is still under review. Current status:{" "}
                      <strong>{getStatusLabel(company.status)}</strong>
                      {company.createdAt && (
                        <>
                          {" · "}Application date:{" "}
                          <strong>
                            {new Date(company.createdAt).toLocaleDateString()}
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

              {isDenied(company.status) && (
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
                    Application Date
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(company.createdAt).toLocaleDateString()}
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

              {/* Audit Information: solo visible si está aprobado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Audit Information
                </h3>

                {isApproved(company.status) ? (
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
                        There are no public audit details. The certification is
                        active.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {/* There are no audit details for this status. */}
                    {company.notes}
                  </div>
                )}
              </div>
            </div>

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
                  This company has been verified and awarded the Peace Seal for
                  their commitment to ethical practices, nonviolence, social
                  impact, and transparent governance.
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/peace-seal/apply"
                className="inline-flex items-center bg-[#548281] text-white px-6 py-3 rounded-md hover:bg-[#2F4858] transition-colors"
              >
                Apply for your Peace Seal certification
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// import { getCompanyBySlug } from "@/lib/api/peace-seal";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ExternalLink,
//   Calendar,
//   Building,
//   Globe,
//   Users,
// } from "lucide-react";

// export const revalidate = 0;

// function getStatusLabel(status: string): string {
//   switch (status) {
//     case "audit_completed":
//       return "Peace Seal Verified";
//     case "did_not_pass":
//       return "Did Not Pass Audit";
//     case "under_review":
//       return "Seal Under Review";
//     case "audit_in_progress":
//       return "Audit in Progress";
//     case "application_submitted":
//     default:
//       return "Application Submitted";
//   }
// }

// function getStatusColor(status: string): string {
//   switch (status) {
//     case "audit_completed":
//       return "text-green-600 bg-green-50 border-green-200";
//     case "did_not_pass":
//       return "text-red-600 bg-red-50 border-red-200";
//     case "under_review":
//       return "text-yellow-600 bg-yellow-50 border-yellow-200";
//     case "audit_in_progress":
//       return "text-blue-600 bg-blue-50 border-blue-200";
//     case "application_submitted":
//     default:
//       return "text-gray-600 bg-gray-50 border-gray-200";
//   }
// }

// export default async function CompanyProfilePage({
//   params,
// }: {
//   params: { slug: string };
// }) {
//   const company = await getCompanyBySlug(params.slug);

//   return (
//     <main className="min-h-screen bg-white">
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {/* Back Navigation */}
//         <div className="mb-6">
//           <Link
//             href="/peace-seal/directory"
//             className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Directory
//           </Link>
//         </div>

//         {/* Company Header */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="bg-gradient-to-r from-[#2F4858] to-[#548281] px-6 py-8 text-white">
//             <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
//             <div className="flex items-center gap-4 text-sm opacity-90">
//               {company.country && (
//                 <div className="flex items-center gap-1">
//                   <Globe className="w-4 h-4" />
//                   {company.country}
//                 </div>
//               )}
//               {company.industry && (
//                 <div className="flex items-center gap-1">
//                   <Building className="w-4 h-4" />
//                   {company.industry}
//                 </div>
//               )}
//               {company.employeeCount && (
//                 <div className="flex items-center gap-1">
//                   <Users className="w-4 h-4" />
//                   {company.employeeCount} employees
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="p-6">
//             {/* Peace Seal Status */}
//             <div className="mb-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-3">
//                 Peace Seal Status
//               </h2>
//               <div
//                 className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(company.status)}`}
//               >
//                 <span className="font-medium">
//                   {getStatusLabel(company.status)}
//                 </span>
//               </div>
//             </div>

//             {/* Company Details Grid */}
//             <div className="grid md:grid-cols-2 gap-6 mb-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Company Information
//                 </h3>

//                 {company.website && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Website
//                     </label>
//                     <a
//                       href={company.website}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors"
//                     >
//                       {company.website}
//                       <ExternalLink className="w-4 h-4 ml-1" />
//                     </a>
//                   </div>
//                 )}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Application Date
//                   </label>
//                   <div className="flex items-center text-gray-900">
//                     <Calendar className="w-4 h-4 mr-2 text-gray-500" />
//                     {new Date(company.createdAt).toLocaleDateString()}
//                   </div>
//                 </div>

//                 {company.lastReviewedAt && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Reviewed
//                     </label>
//                     <div className="flex items-center text-gray-900">
//                       <Calendar className="w-4 h-4 mr-2 text-gray-500" />
//                       {new Date(company.lastReviewedAt).toLocaleDateString()}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Audit Information
//                 </h3>

//                 {company.score !== null && company.score !== undefined && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Audit Score
//                     </label>
//                     <div className="flex items-center">
//                       <div className="text-2xl font-bold text-gray-900">
//                         {company.score}
//                       </div>
//                       <div className="text-sm text-gray-500 ml-2">/ 100</div>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                       <div
//                         className="bg-[#548281] h-2 rounded-full transition-all"
//                         style={{ width: `${company.score}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}

//                 {company.notes && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Notes
//                     </label>
//                     <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
//                       {company.notes}
//                       {/* This company has been verified and awarded the Peace Seal
//                       for their commitment to ethical practices, nonviolence,
//                       social impact, and transparent governance. */}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Peace Seal Badge */}
//             {company.status === "audit_completed" && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
//                 <div className="text-green-600 text-4xl font-bold mb-2">✓</div>
//                 <h3 className="text-lg font-semibold text-green-800 mb-2">
//                   Peace Seal Certified
//                 </h3>
//                 <p className="text-green-700">
//                   This company has been verified and awarded the Peace Seal for
//                   their commitment to ethical practices, nonviolence, social
//                   impact, and transparent governance.
//                 </p>
//               </div>
//             )}

//             {/* Call to Action */}
//             <div className="mt-8 text-center">
//               <Link
//                 href="/peace-seal/apply"
//                 className="inline-flex items-center bg-[#548281] text-white px-6 py-3 rounded-md hover:bg-[#2F4858] transition-colors"
//               >
//                 Apply for Peace Seal Certification
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
