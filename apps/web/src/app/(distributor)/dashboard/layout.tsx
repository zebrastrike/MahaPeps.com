import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function DistributorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Distributor Dashboard"
      subtitle="Oversee distribution channels and partners"
      navigationDescription="Distributor navigation"
      navigationItems={[
        { label: "Overview", href: "/distributor/dashboard" },
        { label: "Partners", href: "/distributor/dashboard/partners" },
        { label: "Logistics", href: "/distributor/dashboard/logistics" },
        { label: "Billing", href: "/distributor/dashboard/billing" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
