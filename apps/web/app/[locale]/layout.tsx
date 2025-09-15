import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { FacebookPixel } from "@/components/analytics/facebook-pixel";
import { SessionExpiryWarning } from "@/components/auth/session-expiry-warning";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/cookies/cookie-banner";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import {
  CriticalResourceHints,
  ResourceOptimizer,
} from "@/components/performance/resource-optimizer";
import { Providers } from "../providers";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { getMetadata } from "./metadata";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

// Generate static params for locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Generate metadata based on locale
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = await params;
  return getMetadata(locale);
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = routing.locales.includes(locale as "en" | "es");
  if (!isValidLocale) {
    notFound();
  }

  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  // Get server-side session to hydrate the client
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale}>
      <head>
        <CriticalResourceHints />
        <StructuredData locale={locale} />
        {/* Social media authority links for SEO */}
        <link rel="me" href="https://www.youtube.com/@Pledge4Peace" />
        <link rel="me" href="https://www.linkedin.com/groups/14488545/" />
        <link rel="me" href="https://www.facebook.com/share/1F8FxiQ6Hh/" />
        <link rel="me" href="https://x.com/pledge4peaceorg" />
        <link rel="me" href="https://www.instagram.com/pledge4peaceorg" />
        <link rel="me" href="https://www.tiktok.com/@pledge4peace5" />
      </head>
      <body className={`${inter.className} h-full w-[100%]`}>
        <GoogleAnalytics />
        <FacebookPixel />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>
            <ResourceOptimizer />
            <LayoutWrapper>{children}</LayoutWrapper>
            <Analytics />
            <SessionExpiryWarning />
            <Toaster />
            <CookieBanner position="bottom" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
