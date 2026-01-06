"use client";

import { useState } from "react";

import { DisclaimerBar } from "@/components/layout/disclaimer-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type ComplianceAcceptances = {
  researchOnly: boolean;
  responsibility: boolean;
  noMedicalAdvice: boolean;
  ageVerification: boolean;
  termsOfService: boolean;
};

const complianceItems: Array<{
  key: keyof ComplianceAcceptances;
  id: string;
  label: string;
}> = [
  {
    key: "researchOnly",
    id: "compliance-research-only",
    label: "I acknowledge that all products are for research purposes only and not for human or veterinary consumption."
  },
  {
    key: "responsibility",
    id: "compliance-responsibility",
    label:
      "I accept full responsibility for proper handling, storage, and disposal of all products in accordance with applicable laws."
  },
  {
    key: "noMedicalAdvice",
    id: "compliance-no-medical-advice",
    label: "I understand that no information on this site constitutes medical or healthcare advice."
  },
  {
    key: "ageVerification",
    id: "compliance-age",
    label: "I confirm that I am at least 21 years of age."
  },
  {
    key: "termsOfService",
    id: "compliance-terms",
    label: "I have read and agree to the Terms of Service and Research Use Policy."
  }
];

export default function CheckoutPage() {
  const [acceptances, setAcceptances] = useState<ComplianceAcceptances>({
    researchOnly: false,
    responsibility: false,
    noMedicalAdvice: false,
    ageVerification: false,
    termsOfService: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleCheckedChange = (key: keyof ComplianceAcceptances) => (value: boolean | "indeterminate") => {
    setAcceptances((prev) => ({
      ...prev,
      [key]: value === true
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setOrderId(null);

    if (!allAccepted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complianceAcknowledgment: {
            type: "checkout",
            acceptances,
            acceptedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error("Order submission failed");
      }

      const payload = await response.json().catch(() => ({}));
      setOrderId(payload.orderId ?? null);
    } catch (error) {
      setErrorMessage("Unable to submit the order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
            <p className="text-sm text-slate-600">
              Orders are reviewed before a payment link is sent. Complete the compliance checks to request review.
            </p>
          </div>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Compliance Acknowledgment</h2>
              <p className="text-sm text-slate-600">All fields are required to proceed.</p>
            </div>

            <div className="space-y-4">
              {complianceItems.map((item) => (
                <label key={item.key} htmlFor={item.id} className="flex items-start gap-3 text-sm text-slate-700">
                  <Checkbox
                    id={item.id}
                    checked={acceptances[item.key]}
                    onCheckedChange={handleCheckedChange(item.key)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Disclaimers</h3>
            <DisclaimerBar variant="checkout" />
          </section>

          {errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {orderId ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Order submitted. Reference ID: {orderId}. An admin will review and send a payment link.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!allAccepted || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Request Payment Link"}
            </Button>
            {!allAccepted ? (
              <span className="text-xs text-slate-500">Accept all compliance items to continue.</span>
            ) : null}
          </div>
        </form>

        <aside className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <p className="text-sm text-slate-600">Cart integration will populate this summary.</p>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>$0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Calculated at review</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>$0.00</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
