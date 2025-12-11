import { RoleShell } from "@/components/layout/role-shell";

const sections = [
  {
    title: "Audit & Compliance",
    body: "Centralize audit logs, risk alerts, and required disclosures.",
  },
  {
    title: "Catalog Controls",
    body: "Manage research-only catalog entries with safeguards against medical claims.",
  },
  {
    title: "Access Policies",
    body: "Configure KYC rules, age verification, and role permissions.",
  },
];

export default function AdminDashboardPage() {
  return (
    <RoleShell title="Admin console" description="Operational command center for the platform.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{section.title}</p>
            <p className="mt-2">{section.body}</p>
          </div>
        ))}
      </div>
    </RoleShell>
  );
}
