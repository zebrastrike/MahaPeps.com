import { RoleShell } from "@/components/layout/role-shell";

const sections = [
  {
    title: "Team & Permissions",
    body: "Invite vetted staff, control role assignments, and enforce least-privilege access.",
  },
  {
    title: "Procurement",
    body: "Plan research-use procurement and manage purchase approvals without medical protocols.",
  },
  {
    title: "Compliance Logs",
    body: "Review audit-ready activity logs to satisfy internal oversight requirements.",
  },
];

export default function ClinicDashboardPage() {
  return (
    <RoleShell
      title="Clinic workspace"
      description="For verified clinics conducting research-only procurement and fulfillment."
    >
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
