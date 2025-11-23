import { Metadata } from "next";

// Define metadata for each locale
const metadata: Record<string, Metadata> = {
  en: {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org"
    ),
    title:
      "Pledge4Peace | Global Campaigns for Peace, Democracy & Human Rights",
    description:
      "Join Pledge4Peace: the only platform with people-powered solutions on global conflicts. Vote to strengthen peace and democracy. Take action today.",
    keywords:
      "peace, democracy, human rights, global campaigns, social justice, conflict resolution, community action",
    authors: [{ name: "Pledge4Peace" }],
    creator: "Pledge4Peace",
    publisher: "Pledge4Peace",

    // Open Graph metadata for social sharing
    openGraph: {
      title:
        "Pledge4Peace | Global Campaigns for Peace, Democracy & Human Rights",
      description:
        "Join Pledge4Peace: the only platform with people-powered solutions on global conflicts. Vote to strengthen peace and democracy. Take action today.",
      url: "https://pledge4peace.org",
      siteName: "Pledge4Peace",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/p4p_logo_renewed.png",
          width: 1200,
          height: 630,
          alt: "Pledge4Peace - Global Campaigns for Peace",
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title:
        "Pledge4Peace | Global Campaigns for Peace, Democracy & Human Rights",
      description:
        "Join Pledge4Peace: the only platform with people-powered solutions on global conflicts. Vote to strengthen peace and democracy. Take action today.",
      creator: "@Pledge4Peace",
      site: "@Pledge4Peace",
      images: ["/p4p_logo_renewed.png"],
    },

    // Additional SEO metadata
    alternates: {
      canonical: "https://pledge4peace.org",
    },

    // Verification and authority signals
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Social media profiles for authority
    other: {
      "og:see_also": [
        "https://www.youtube.com/@Pledge4Peace",
        "https://www.linkedin.com/company/pledge4peace-org",
        "https://www.facebook.com/share/1F8FxiQ6Hh/",
        "https://x.com/pledge4peaceorg",
        "https://www.instagram.com/pledge4peaceorg",
        "https://www.tiktok.com/@pledge4peace5",
      ].join(","),
    },

    icons: {
      icon: [
        { url: "/favicon/favicon.ico?v=2" },
        { url: "/favicon/favicon.svg?v=2", type: "image/svg+xml" },
        {
          url: "/favicon/favicon-16x16.png?v=2",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicon/favicon-32x32.png?v=2",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/favicon/favicon-96x96.png?v=2",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/favicon/apple-touch-icon.png?v=2",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest",
  },
  es: {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org"
    ),
    title:
      "Pledge4Peace | Campañas Globales para la Paz, Democracia & Derechos Humanos",
    description:
      "Únete a Pledge4Peace: la única plataforma con soluciones impulsadas por la gente en conflictos globales. Vota para fortalecer la paz y la democracia. ¡Toma acción hoy!",
    keywords:
      "paz, democracia, derechos humanos, campañas globales, justicia social, resolución de conflictos, acción comunitaria",
    authors: [{ name: "Pledge4Peace" }],
    creator: "Pledge4Peace",
    publisher: "Pledge4Peace",

    // Open Graph metadata for social sharing
    openGraph: {
      title:
        "Pledge4Peace | Campañas Globales para la Paz, Democracia & Derechos Humanos",
      description:
        "Únete a Pledge4Peace: la única plataforma con soluciones impulsadas por la gente en conflictos globales. Vota para fortalecer la paz y la democracia. ¡Toma acción hoy!",
      url: "https://pledge4peace.org/es",
      siteName: "Pledge4Peace",
      type: "website",
      locale: "es_ES",
      images: [
        {
          url: "/p4p_logo_renewed.png",
          width: 1200,
          height: 630,
          alt: "Pledge4Peace - Campañas Globales para la Paz",
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title:
        "Pledge4Peace | Campañas Globales para la Paz, Democracia & Derechos Humanos",
      description:
        "Únete a Pledge4Peace: la única plataforma con soluciones impulsadas por la gente en conflictos globales. Vota para fortalecer la paz y la democracia. ¡Toma acción hoy!",
      creator: "@Pledge4Peace",
      site: "@Pledge4Peace",
      images: ["/p4p_logo_renewed.png"],
    },

    // Additional SEO metadata
    alternates: {
      canonical: "https://pledge4peace.org/es",
    },

    // Verification and authority signals
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Social media profiles for authority
    other: {
      "og:see_also": [
        "https://www.youtube.com/@Pledge4Peace",
        "https://www.linkedin.com/groups/14488545/",
        "https://www.facebook.com/share/1F8FxiQ6Hh/",
        "https://x.com/pledge4peaceorg",
        "https://www.instagram.com/pledge4peaceorg",
        "https://www.tiktok.com/@pledge4peace5",
      ].join(","),
    },

    icons: {
      icon: [
        { url: "/favicon/favicon.ico?v=2" },
        { url: "/favicon/favicon.svg?v=2", type: "image/svg+xml" },
        {
          url: "/favicon/favicon-16x16.png?v=2",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicon/favicon-32x32.png?v=2",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/favicon/favicon-96x96.png?v=2",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/favicon/apple-touch-icon.png?v=2",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest",
  },
};

export function getMetadata(locale: string): Metadata {
  return metadata[locale] || metadata.en;
}
