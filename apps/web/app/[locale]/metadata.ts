import { Metadata } from "next";

// Define metadata for each locale
const metadata: Record<string, Metadata> = {
  en: {
    title: "Pledge4Peace",
    description: "No Hate, No Divide - Just Peace Worldwide",
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
    title: "Pledge4Peace",
    description: "Sin Odio, Sin División - Solo Paz Mundial",
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
