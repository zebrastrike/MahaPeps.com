import { ReactNode } from "react";

interface RoleShellProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function RoleShell({ title, description, children }: RoleShellProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 text-muted-foreground">
        {children ?? "Coming soon: role-specific dashboards and workflows."}
      </div>
    </div>
  );
}
