import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function ClientDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Client Dashboard"
      subtitle="Client view of research workflows"
      navigationDescription="Client navigation"
      navigationItems={[
        { label: "Overview", href: "/dashboard" },
        { label: "Orders", href: "/dashboard/orders" },
        { label: "Research Stacks", href: "/stacks" },
        { label: "Messages", href: "/dashboard/messages" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
