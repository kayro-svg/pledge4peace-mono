import { DirectoryItem } from "@/lib/api/peace-seal";
import Link from "next/link";

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

export function DirectoryPage({
  items,
  q,
  country,
  status,
}: DirectoryPageProps) {
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
          to companies that demonstrate a genuine commitment to peace,
          democracy, and people-first values.
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
                  Notes
                </th>
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
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {item.notes || "—"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={5}
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
          Showing {items.length} companies.
          <Link
            href="/peace-seal/apply"
            className="ml-2 text-[#548281] hover:underline"
          >
            Apply for Peace Seal certification →
          </Link>
        </p>
      </div>
    </div>
  );
}
