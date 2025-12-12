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
    <div className="flex min-h-screen flex-col bg-neutral-50 text-slate-900">
      <Header title={title} subtitle={subtitle} />
      <Navigation items={navigationItems} description={navigationDescription} />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </main>
      <DisclaimerBar />
    </div>
  );
}
