import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground">Portal access requires verification and compliance review.</p>
      </div>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <p>Authentication flows will be added here. No medical or biological data will be collected.</p>
        <div className="flex gap-3">
          <Button disabled>Continue</Button>
          <Button asChild variant="outline">
            <Link href="/register">Request access</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
