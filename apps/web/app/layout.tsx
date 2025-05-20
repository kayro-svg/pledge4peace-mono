import type { ReactNode } from "react";
import { JSX } from "react";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

const inter = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Pledge4Peace - Building a Peaceful World Together",
  description:
    "Join our global movement to promote peace through pledges, advocacy, and action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
