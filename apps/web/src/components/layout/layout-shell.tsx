import { ReactNode } from "react";

import { DisclaimerBar } from "@/components/layout/disclaimer-bar";
import { Header } from "@/components/layout/header";
import { Navigation, type NavigationItem } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export type LayoutShellProps = {
  title: string;
  subtitle?: string;
  navigationItems: NavigationItem[];
  navigationDescription?: string;
  children: ReactNode;
  className?: string;
};

export function LayoutShell({
  title,
  subtitle,
  navigationItems,
  navigationDescription,
  children,
  className,
}: LayoutShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-charcoal-900 text-clinical-white", className)}>
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1">
        {children}
      </main>
      <DisclaimerBar variant="footer" />
    </div>
  );
}
