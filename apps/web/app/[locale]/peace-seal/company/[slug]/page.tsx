import { notFound } from "next/navigation";
import { getCompanyBySlug, listCompanyReviews } from "@/lib/api/peace-seal";
import PublicCompanyProfile from "@/components/peace-seal/public-company-profile/PublicCompanyProfile";

export const revalidate = 0;

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  // Handle both Promise and direct params objects to ensure compatibility
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  // Guard against missing slug
  if (!slug) {
    console.error("CompanyProfilePage: slug is missing");
    notFound();
  }

  console.log("CompanyProfilePage request to /peace-seal/company/:slug", slug);
  const company = await getCompanyBySlug(slug);

  const reviewsData = await listCompanyReviews(company.id, { limit: 10 }).catch(
    () => ({ items: [], total: 0 })
  );
  const reviews = reviewsData.items || [];

  return <PublicCompanyProfile company={company} reviews={reviews} />;
}
