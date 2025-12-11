import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { ComplianceBanner } from "@/components/banners/compliance-banner";
import { GlobalDisclaimer } from "@/components/banners/global-disclaimer";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MAHA Peptides OS",
  description: "Compliance-first commerce platform for research peptides and supplies.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="container flex-1 py-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                <span>MAHA Peptides OS: compliance-first ecommerce. KYC and safety controls enforced.</span>
                <div className="flex items-center gap-3 text-xs">
                  <Link className="text-primary underline-offset-4 hover:underline" href="/catalog">
                    Browse catalog
                  </Link>
                  <Link className="text-primary underline-offset-4 hover:underline" href="/login">
                    Access portals
                  </Link>
                </div>
              </div>
              <ComplianceBanner />
              <GlobalDisclaimer />
              {children}
            </main>
            <footer className="border-t bg-muted/50">
              <div className="container py-6 text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} MAHA Peptides OS. Research use only. No medical advice provided.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
