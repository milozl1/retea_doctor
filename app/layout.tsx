import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/layout/cookie-consent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rețea Medicală | MedLearn",
  description:
    "Rețea de socializare profesională pentru medici și studenți la medicină",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SWRProvider>
            {children}
            <Toaster />
            <CookieConsent />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
