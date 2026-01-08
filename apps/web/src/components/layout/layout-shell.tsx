import { ReactNode } from "react";

import { DisclaimerBar } from "@/components/layout/disclaimer-bar";
import { Header } from "@/components/layout/header";
import { Navigation, type NavigationItem } from "@/components/layout/navigation";

export type LayoutShellProps = {
  title: string;
  subtitle?: string;
  navigationItems: NavigationItem[];
  navigationDescription?: string;
  children: ReactNode;
};

export function LayoutShell({
  title,
  subtitle,
  navigationItems,
  navigationDescription,
  children
}: LayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal-900 text-clinical-white">
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1">
        {children}
      </main>
      <DisclaimerBar variant="footer" />
    </div>
  );
}
