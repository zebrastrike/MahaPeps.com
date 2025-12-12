import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function ClientDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Client Dashboard"
      subtitle="Client view of MAHA therapy workflows"
      navigationDescription="Client navigation"
      navigationItems={[
        { label: "Overview", href: "/dashboard" },
        { label: "Orders", href: "/dashboard/orders" },
        { label: "Protocols", href: "/dashboard/protocols" },
        { label: "Messages", href: "/dashboard/messages" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
