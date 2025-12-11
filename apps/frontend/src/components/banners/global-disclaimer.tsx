import { AlertTriangle } from "lucide-react";

import { disclaimers } from "@/lib/utils";

export function GlobalDisclaimer() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
      <AlertTriangle className="h-5 w-5" aria-hidden />
      <div className="space-y-1">
        {disclaimers.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}
