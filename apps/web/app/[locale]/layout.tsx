import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { FacebookPixel } from "@/components/analytics/facebook-pixel";
import { SessionExpiryWarning } from "@/components/auth/session-expiry-warning";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/cookies/cookie-banner";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Providers } from "../providers";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { getMetadata } from "./metadata";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Generate static params for locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Generate metadata based on locale
export async function generateMetadata({
  params,
}: {
  params: { locale: any };
}): Promise<Metadata> {
  const { locale } = await params;
  return getMetadata(locale);
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: any };
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = routing.locales.includes(locale as any);
  if (!isValidLocale) {
    notFound();
  }

  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${inter.className} h-full w-[100%]`}>
        <GoogleAnalytics />
        <FacebookPixel />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
            <SessionExpiryWarning />
            <Toaster />
            <CookieBanner position="bottom" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
