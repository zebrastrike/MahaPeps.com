import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";
import { AgeGate } from "@/components/age-gate/age-gate";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AgeGate />
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
    </>
  );
}
