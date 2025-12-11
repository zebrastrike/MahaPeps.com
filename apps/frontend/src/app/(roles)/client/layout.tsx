import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <section className="space-y-8">{children}</section>;
}
