"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PendingPayment {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  transactionReference?: string;
  paymentProof: string;
  submittedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  orderSummary: {
    itemCount: number;
    subtotal: number;
    shipping: number;
    total: number;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments/pending");

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        console.error("Failed to fetch pending payments");
      }
    } catch (error) {
      console.error("Failed to fetch pending payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!confirm("Are you sure you want to approve this payment?")) {
      return;
    }

    setActionInProgress(paymentId);

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Payment approved successfully!");
        await fetchPendingPayments();
      } else {
        const error = await response.json();
        alert(`Failed to approve payment: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to approve payment:", error);
      alert("Failed to approve payment. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionInProgress(paymentId);

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        alert("Payment rejected successfully");
        setShowRejectModal(null);
        setRejectionReason("");
        await fetchPendingPayments();
      } else {
        const error = await response.json();
        alert(`Failed to reject payment: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to reject payment:", error);
      alert("Failed to reject payment. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };

  const openProofImage = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading pending payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Payment Verification
          </h1>
          <p className="mt-2 text-slate-600">
            Review and verify manual payment submissions (Zelle/CashApp)
          </p>
        </div>
        <Button onClick={fetchPendingPayments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Pending Count */}
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <div className="font-semibold text-amber-900">
              {payments.length} Payment{payments.length !== 1 ? "s" : ""} Pending Verification
            </div>
            <div className="text-sm text-amber-700">
              Review payment proofs and approve or reject within 24-48 hours
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="text-6xl">✓</div>
          <div className="mt-4 text-lg font-medium text-slate-900">
            All caught up!
          </div>
          <div className="mt-2 text-slate-600">
            No pending payment verifications at this time
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.paymentId}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Payment Details */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Order ID
                    </div>
                    <code className="text-sm text-slate-900">
                      {payment.orderId}
                    </code>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Customer
                    </div>
                    <div className="text-sm text-slate-900">
                      {payment.user.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      Role: {payment.user.role}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Payment Method
                    </div>
                    <div className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
                      {payment.method}
                    </div>
                  </div>

                  {payment.transactionReference && (
                    <div>
                      <div className="text-sm font-medium text-slate-600">
                        Transaction Reference
                      </div>
                      <code className="text-sm text-slate-900">
                        {payment.transactionReference}
                      </code>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Submitted
                    </div>
                    <div className="text-sm text-slate-900">
                      {new Date(payment.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-600">
                      Order Summary
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-900">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{payment.orderSummary.itemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${payment.orderSummary.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${payment.orderSummary.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
                        <span>Total:</span>
                        <span className="text-teal-600">
                          ${payment.orderSummary.total.toFixed(2)} {payment.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Proof */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Payment Proof
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => openProofImage(payment.paymentProof)}
                        className="group relative block w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 transition-all hover:border-teal-500"
                      >
                        <div className="aspect-[4/3] relative">
                          <Image
                            src={payment.paymentProof}
                            alt="Payment proof screenshot"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext fill='%2364748b' font-family='Arial' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EClick to view proof%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-10">
                            <div className="text-white opacity-0 transition-opacity group-hover:opacity-100">
                              🔍 Click to view full size
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleApprove(payment.paymentId)}
                      disabled={actionInProgress === payment.paymentId}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {actionInProgress === payment.paymentId
                        ? "Processing..."
                        : "✓ Approve Payment"}
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(payment.paymentId)}
                      disabled={actionInProgress === payment.paymentId}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      ✗ Reject Payment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reject Modal */}
              {showRejectModal === payment.paymentId && (
                <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <div className="mb-2 font-semibold text-red-900">
                    Reject Payment
                  </div>
                  <div className="mb-3 text-sm text-red-700">
                    Please provide a reason for rejection (this will be sent to the customer):
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Screenshot unclear, amount doesn't match, transaction not found..."
                    className="w-full rounded-md border border-red-300 p-2 text-sm"
                    rows={3}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => handleReject(payment.paymentId)}
                      disabled={actionInProgress === payment.paymentId || !rejectionReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRejectModal(null);
                        setRejectionReason("");
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
