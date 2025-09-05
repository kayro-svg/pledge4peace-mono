import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { Metadata } from "next";

// Generate metadata for Contact page
export async function generateMetadata({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const contactUrl = locale === "en" ? `${baseUrl}/contact` : `${baseUrl}/${locale}/contact`;

  const title = locale === "es" 
    ? "Contacto | Pledge4Peace - Ponte en Contacto con Nosotros"
    : "Contact Us | Pledge4Peace - Get in Touch";
  
  const description = locale === "es"
    ? "Contáctanos para más información sobre nuestras campañas de paz, democracia y derechos humanos. Estamos aquí para ayudarte."
    : "Contact us for more information about our peace, democracy, and human rights campaigns. We're here to help.";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: locale === "es" 
      ? "contacto, información, ayuda, paz, democracia, derechos humanos"
      : "contact, information, help, peace, democracy, human rights",
    
    alternates: {
      canonical: contactUrl,
    },

    openGraph: {
      title,
      description,
      url: contactUrl,
      siteName: "Pledge4Peace",
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: "/p4p_logo_renewed.png",
          width: 1200,
          height: 630,
          alt: "Pledge4Peace - Contact Us",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/p4p_logo_renewed.png"],
      creator: "@Pledge4Peace",
      site: "@Pledge4Peace",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </main>
  );
}
