import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl border bg-card p-8 shadow-sm lg:grid-cols-2">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Shield className="h-4 w-4" aria-hidden />
            Compliance-first ecommerce
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MAHA Peptides OS</h1>
          <p className="text-lg text-muted-foreground">
            A secure storefront and portal framework for research products. Built with role-aware layouts
            for clients, clinics, distributors, and admins—without medical claims.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/catalog" className="flex items-center gap-2">
                View catalog
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Access portals</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 rounded-xl bg-muted/50 p-6 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-background p-4">
            <p className="font-semibold text-foreground">Built-in safeguards</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Research-only messaging across all flows.</li>
              <li>Disclaimers on every page; no dosing or medical guidance.</li>
              <li>KYC and access tiers for wholesale and clinics.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="font-semibold text-foreground">Ready for expansion</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Role-based dashboards with segmented layouts.</li>
              <li>Reusable UI components aligned with ShadCN patterns.</li>
              <li>Tailwind theme tokens and dark mode support.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
