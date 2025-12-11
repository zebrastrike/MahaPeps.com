import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <section className="space-y-8">{children}</section>;
}
