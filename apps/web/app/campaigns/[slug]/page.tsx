// Este archivo actúa como Server Component
import { CampaignDetailContent } from "./campaign-detail-content";
// import { getCampaignBySlug, getCampaignSlugs } from "@/lib/api";
import { getCampaignBySlug } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";

// Esta función genera estáticamente las rutas en tiempo de compilación
// export async function generateStaticParams() {
//   const campaigns = await getCampaignSlugs();
//   return campaigns.map((slug) => ({ slug: slug.current }));
// }

// export async function generateStaticParams() {
//   const campaigns = await getCampaignSlugs();
//   return campaigns
//     .filter(
//       (slug) => typeof slug?.current === "string" && slug.current.length > 0
//     )
//     .map((slug) => ({ slug: slug.current }));
// }

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // En un componente async podemos acceder a params.slug de forma segura
  const { slug } = await params;

  // Obtener los datos de la campaña usando la API
  const campaign = await getCampaignBySlug(slug);

  // Si no existe la campaña, mostrar 404
  if (!campaign) {
    notFound();
  }

  // Pasamos el campaign como prop al Client Component
  return <CampaignDetailContent campaign={campaign} />;
}
