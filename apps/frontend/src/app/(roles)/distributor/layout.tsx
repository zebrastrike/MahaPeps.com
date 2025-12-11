import type { ReactNode } from "react";

export default function DistributorLayout({ children }: { children: ReactNode }) {
  return <section className="space-y-8">{children}</section>;
}
