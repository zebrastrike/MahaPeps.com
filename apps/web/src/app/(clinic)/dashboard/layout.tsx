import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function ClinicDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Clinic Dashboard"
      subtitle="Clinic operations and patient management"
      navigationDescription="Clinic navigation"
      navigationItems={[
        { label: "Overview", href: "/clinic/dashboard" },
        { label: "Patients", href: "/clinic/dashboard/patients" },
        { label: "Inventory", href: "/clinic/dashboard/inventory" },
        { label: "Staff", href: "/clinic/dashboard/staff" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
