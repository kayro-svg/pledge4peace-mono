// Este archivo actúa como Server Component
import { CampaignDetailContent } from "./campaign-detail-content";
import { getCampaignBySlug, getCampaignSlugs } from "@/lib/api";
import { notFound } from "next/navigation";

// Esta función genera estáticamente las rutas en tiempo de compilación
export async function generateStaticParams() {
  const campaigns = await getCampaignSlugs();
  return campaigns;
}

export default async function Page({ params }: { params: { slug: string } }) {
  // En un componente async podemos acceder a params.slug de forma segura
  const { slug } = params;

  // Obtener los datos de la campaña usando la API
  const campaign = await getCampaignBySlug(slug);

  // Si no existe la campaña, mostrar 404
  if (!campaign) {
    notFound();
  }

  // Pasamos el campaign como prop al Client Component
  return <CampaignDetailContent campaign={campaign} />;
}
