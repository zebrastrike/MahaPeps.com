import { RoleShell } from "@/components/layout/role-shell";

const sections = [
  {
    title: "Orders & Tracking",
    body: "Manage research-only purchases, order history, and delivery updates.",
  },
  {
    title: "Account Verification",
    body: "Submit documentation for identity and age verification to unlock full access.",
  },
  {
    title: "Support & Compliance",
    body: "Request assistance for billing or account issues. No medical advice is offered.",
  },
];

export default function ClientDashboardPage() {
  return (
    <RoleShell
      title="Client portal"
      description="Consumer-facing experience with research-only catalog access and guardrails."
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
