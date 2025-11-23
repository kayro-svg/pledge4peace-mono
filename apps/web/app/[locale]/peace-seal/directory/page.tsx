import { DirectoryPage } from "@/components/peace-seal/directory-page/directory-page";
import { listDirectory } from "@/lib/api/peace-seal";

export const revalidate = 0;

type RawParam = string | string[] | undefined;
const pick = (v: RawParam) => (Array.isArray(v) ? v[0] : v);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: RawParam;
    country?: RawParam;
    status?: RawParam;
  }>;
}) {
  const sp = await searchParams;

  const q = pick(sp?.q) ?? "";
  const country = pick(sp?.country) ?? "";
  const status = pick(sp?.status) ?? "";

  const items = await listDirectory({
    q: q || undefined,
    country: country || undefined,
    status: status || undefined,
  });

  return (
    <main className="min-h-screen bg-white">
      <DirectoryPage items={items} q={q} country={country} status={status} />
    </main>
  );
}
