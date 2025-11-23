import { getCompanyBySlug, listCompanyReviews } from "@/lib/api/peace-seal";
import PublicCompanyProfile from "@/components/peace-seal/public-company-profile/PublicCompanyProfile";

export const revalidate = 0;

export default async function CompanyProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompanyBySlug(params.slug);

  const reviewsData = await listCompanyReviews(company.id, { limit: 10 }).catch(
    () => ({ items: [], total: 0 })
  );
  const reviews = reviewsData.items || [];

  return <PublicCompanyProfile company={company} reviews={reviews} />;
}
