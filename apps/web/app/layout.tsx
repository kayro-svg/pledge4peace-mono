import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { CookieBanner } from "@/components/cookies/cookie-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-full w-[100%]`}>
        <GoogleAnalytics />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
          <CookieBanner position="bottom" />
        </Providers>
      </body>
    </html>
  );
}
