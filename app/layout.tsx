import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MedRețea — Rețeaua Medicilor",
  description: "Rețeaua de socializare profesională a medicilor din România",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={geistSans.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <SWRProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1E293B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                },
              }}
            />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
