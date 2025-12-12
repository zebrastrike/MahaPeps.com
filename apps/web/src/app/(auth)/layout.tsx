import type { ReactNode } from "react";

import { LayoutShell } from "@/components/layout/layout-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutShell
      title="Authentication"
      subtitle="Entry points for users to access MAHA Peptides OS"
      navigationDescription="Authentication navigation"
      navigationItems={[
        { label: "Sign In", href: "/sign-in" },
        { label: "Create Account", href: "/create-account" },
        { label: "Recover Access", href: "/recover" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
