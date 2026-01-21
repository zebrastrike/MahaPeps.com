import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";

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
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-S44XV43D0G"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-S44XV43D0G');`
          }}
        />
      </head>
      <body className="min-h-screen bg-charcoal-900 text-clinical-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
