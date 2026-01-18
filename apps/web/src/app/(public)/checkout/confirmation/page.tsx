"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const zelleId = process.env.NEXT_PUBLIC_ZELLE_ID || "payments@mahapeptides.com";
  const cashAppTag = process.env.NEXT_PUBLIC_CASHAPP_TAG || "$MahaPeptides";

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-900">Order Not Found</h1>
          <p className="mt-2 text-sm text-red-700">
            No order ID was provided. Please try placing your order again.
          </p>
          <Link href="/checkout" className="mt-4 inline-block">
            <Button>Return to Checkout</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Order Submitted</h1>
        <p className="mt-2 text-slate-600">
          Your order has been received and is pending payment.
        </p>
      </div>

      {/* Order Reference */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm text-slate-600">Order Reference Number</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">#{orderId}</p>
      </div>

      {/* Payment Status Badge */}
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">Payment Pending</h3>
            <p className="mt-1 text-sm text-amber-700">
              We&apos;ve sent payment instructions to your email. Please complete payment using one of
              the methods below within 48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Payment Instructions</h2>

        {/* Zelle Option */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Option 1: Zelle</h3>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
              Recommended
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Zelle ID</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-mono text-slate-900">
                  {zelleId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(zelleId, "zelle")}
                >
                  {copiedField === "zelle" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Payment Note</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-mono text-slate-900">
                  Order #{orderId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`Order #${orderId}`, "zelle-note")}
                >
                  {copiedField === "zelle-note" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CashApp Option */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Option 2: CashApp</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">CashApp Tag</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-mono text-slate-900">
                  {cashAppTag}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cashAppTag, "cashapp")}
                >
                  {copiedField === "cashapp" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Payment Note</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-mono text-slate-900">
                  Order #{orderId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`Order #${orderId}`, "cashapp-note")}
                >
                  {copiedField === "cashapp-note" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 font-semibold text-slate-900">Important:</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              <span>
                Please include your order number (#{orderId}) in the payment note
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              <span>Payment must be received within 48 hours to process your order</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              <span>
                Once payment is confirmed, we will begin processing your order and send a shipping
                notification
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600">•</span>
              <span>You can track your order status in your dashboard</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard/orders">
          <Button variant="default">View Order Status</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={(
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="text-sm text-slate-600">Loading confirmation...</div>
        </div>
      )}
    >
      <ConfirmationContent />
    </Suspense>
  );
}
