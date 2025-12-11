import { RoleShell } from "@/components/layout/role-shell";

const sections = [
  {
    title: "Inventory Intake",
    body: "Placeholder for compliant inventory setup and labeling controls.",
  },
  {
    title: "Partner Management",
    body: "Manage approved clinics and clients with clear access tiers and contracts.",
  },
  {
    title: "Logistics",
    body: "Coordinate research-use shipments with chain-of-custody visibility.",
  },
];

export default function DistributorDashboardPage() {
  return (
    <RoleShell
      title="Distributor console"
      description="For authorized distributors managing supply chain operations without medical claims."
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
