"use client";

interface StructuredDataProps {
  locale: string;
}

export function StructuredData({ locale }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const currentUrl = locale === "en" ? baseUrl : `${baseUrl}/${locale}`;

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pledge4Peace",
    alternateName: "Pledge4Peace.org",
    url: baseUrl,
    logo: `${baseUrl}/p4p_logo_renewed.png`,
    description: locale === "es" 
      ? "Únete a Pledge4Peace: la única plataforma con soluciones impulsadas por la gente en conflictos globales. Vota para fortalecer la paz y la democracia."
      : "Join Pledge4Peace: the only platform with people-powered solutions on global conflicts. Vote to strengthen peace and democracy.",
    
    // Contact information
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-862-666-1636",
      contactType: "customer service",
      email: "info@pledge4peace.org",
      availableLanguage: ["English", "Spanish"]
    },

    // Address
    address: {
      "@type": "PostalAddress",
      streetAddress: "3392 NY-8",
      addressLocality: "South New Berlin",
      addressRegion: "NY",
      postalCode: "13843",
      addressCountry: "US"
    },

    // Social media profiles for authority and SEO
    sameAs: [
      "https://www.youtube.com/@Pledge4Peace",
      "https://www.linkedin.com/groups/14488545/",
      "https://www.facebook.com/share/1F8FxiQ6Hh/",
      "https://x.com/pledge4peaceorg",
      "https://www.instagram.com/pledge4peaceorg",
      "https://www.tiktok.com/@pledge4peace5"
    ],

    // Organization type and focus
    "@id": `${baseUrl}/#organization`,
    foundingDate: "2024",
    knowsAbout: [
      "Peace building",
      "Democracy",
      "Human rights",
      "Conflict resolution",
      "Social justice",
      "Community organizing",
      "Global campaigns"
    ],
    
    // Mission and purpose
    mission: locale === "es"
      ? "Promover la paz, la democracia y los derechos humanos a través de campañas globales impulsadas por la comunidad."
      : "Promoting peace, democracy, and human rights through community-driven global campaigns.",

    // Website data
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": currentUrl
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pledge4Peace",
    url: baseUrl,
    description: locale === "es"
      ? "Plataforma global para campañas de paz, democracia y derechos humanos"
      : "Global platform for peace, democracy, and human rights campaigns",
    
    // Search functionality
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },

    // Publisher information
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },

    // Supported languages
    inLanguage: ["en", "es"]
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: "Pledge4Peace",
    alternateName: "Pledge4Peace.org",
    url: baseUrl,
    logo: `${baseUrl}/p4p_logo_renewed.png`,
    image: `${baseUrl}/p4p_logo_renewed.png`,
    
    // Business description
    description: locale === "es"
      ? "Organización dedicada a promover la paz, democracia y derechos humanos a través de campañas globales impulsadas por la comunidad."
      : "Organization dedicated to promoting peace, democracy, and human rights through community-driven global campaigns.",
    
    // Contact information
    telephone: "+1-862-666-1636",
    email: "info@pledge4peace.org",
    
    // Address
    address: {
      "@type": "PostalAddress",
      streetAddress: "3392 NY-8",
      addressLocality: "South New Berlin",
      addressRegion: "NY",
      postalCode: "13843",
      addressCountry: "US"
    },
    
    // Geographic coordinates (approximate for South New Berlin, NY)
    geo: {
      "@type": "GeoCoordinates",
      latitude: 42.5492,
      longitude: -75.3379
    },
    
    // Business hours (24/7 online platform)
    openingHours: "Mo-Su 00:00-23:59",
    
    // Services offered
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: locale === "es" ? "Campañas de Paz" : "Peace Campaigns",
          description: locale === "es" 
            ? "Plataforma para crear y participar en campañas globales de paz"
            : "Platform for creating and participating in global peace campaigns"
        }
      },
      {
        "@type": "Offer", 
        itemOffered: {
          "@type": "Service",
          name: locale === "es" ? "Promoción de la Democracia" : "Democracy Promotion",
          description: locale === "es"
            ? "Iniciativas para fortalecer los sistemas democráticos"
            : "Initiatives to strengthen democratic systems"
        }
      }
    ],
    
    // Social media profiles
    sameAs: [
      "https://www.youtube.com/@Pledge4Peace",
      "https://www.linkedin.com/groups/14488545/",
      "https://www.facebook.com/share/1F8FxiQ6Hh/",
      "https://x.com/pledge4peaceorg",
      "https://www.instagram.com/pledge4peaceorg",
      "https://www.tiktok.com/@pledge4peace5"
    ],
    
    // Organization type
    additionalType: "https://schema.org/NGO",
    
    // Areas served
    areaServed: {
      "@type": "Place",
      name: "Worldwide"
    },
    
    // Languages
    knowsLanguage: ["en", "es"]
  };

  return (
    <>
      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData, null, 2),
        }}
      />
      
      {/* Website Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData, null, 2),
        }}
      />
      
      {/* LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessData, null, 2),
        }}
      />
    </>
  );
}
