import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Admin"
      subtitle="Platform operations and governance"
      navigationDescription="Admin navigation"
      navigationItems={[
        { label: "Overview", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: "Orders", href: "/admin/orders" },
        { label: "Payments", href: "/admin/payments" },
        { label: "KYC", href: "/admin/kyc" },
        { label: "Users", href: "/admin/users" },
        { label: "Moderation", href: "/admin/moderation" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Audit", href: "/admin/audit" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}

