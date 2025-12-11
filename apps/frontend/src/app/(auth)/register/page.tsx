import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h1 className="text-2xl font-semibold">Request access</h1>
        <p className="text-muted-foreground">
          Submit onboarding details to activate client, clinic, distributor, or admin access. KYC and safety
          validation are required.
        </p>
      </div>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <p>Registration fields will be added here. Sensitive medical or biological information will not be stored.</p>
        <div className="flex gap-3">
          <Button disabled>Start verification</Button>
          <Button asChild variant="outline">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
