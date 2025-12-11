"use client";

import { ShieldAlert, ShieldCheck, Siren } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { disclaimers } from "@/lib/utils";

export function ComplianceBanner() {
  const [acknowledged, setAcknowledged] = useState(false);

  if (acknowledged) {
    return null;
  }

  return (
    <div className="banner-shadow mb-6 rounded-xl border bg-card p-4 text-sm text-foreground">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
            <Siren className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Compliance & Safety Notice</p>
            <p className="text-muted-foreground">
              MAHA Peptides OS is a commerce platform for research products only. Access to
              clinical, distributor, or admin tooling requires verification. No medical advice or
              biological claims are provided.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {disclaimers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" aria-hidden /> Verified accounts only
              </span>
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" aria-hidden /> No dosing or protocol info
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          className="self-end md:self-center"
          onClick={() => setAcknowledged(true)}
        >
          Acknowledge
        </Button>
      </div>
    </div>
  );
}
