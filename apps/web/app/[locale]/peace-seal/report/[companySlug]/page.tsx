import ReportClient from "@/components/peace-seal/report-page/report-page";
import { getReportReasons, getCompanyBySlug } from "@/lib/api/peace-seal";

type Props = { params: { locale: string; companySlug: string } | Promise<{ locale: string; companySlug: string }> };

export default async function Page({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale, companySlug } = resolvedParams;

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
