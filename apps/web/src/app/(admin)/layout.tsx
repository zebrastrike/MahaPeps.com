import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Admin"
      subtitle="Platform administration and governance"
      navigationDescription="Admin navigation"
      navigationItems={[
        { label: "Overview", href: "/admin" },
        { label: "Users", href: "/admin/users" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Audit", href: "/admin/audit" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
