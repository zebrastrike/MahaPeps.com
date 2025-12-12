import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Public Site"
      subtitle="Introduce prospects to MAHA Peptides OS"
      navigationDescription="High-level marketing and discovery navigation"
      navigationItems={[
        { label: "Home", href: "/" },
        { label: "Solutions", href: "/solutions" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
