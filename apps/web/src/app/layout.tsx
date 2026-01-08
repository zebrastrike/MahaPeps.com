import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MAHA Peptides - American-Made Research Peptides",
    template: "%s | MAHA Peptides"
  },
  description: "Pharmaceutical-grade research peptides manufactured in the USA. 99%+ purity with full COA documentation. Trusted by laboratories and research institutions nationwide."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-charcoal-900 text-clinical-white antialiased">{children}</body>
    </html>
  );
}
