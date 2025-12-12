import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MAHA Peptides OS",
    template: "%s | MAHA Peptides OS"
  },
  description: "Frontend scaffolding for MAHA Peptides OS"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
